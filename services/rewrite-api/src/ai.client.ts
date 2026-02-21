/**
 * @file services/rewrite-api/src/ai.client.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * AI client for rewrite-api.
 * Uses @google/generative-ai SDK with gemini-2.5-flash.
 *
 * Anti-fabrication guarantee (code-level, not prompt-only):
 *   extractDigits() collects every number from the original bullet.
 *   verifyDigits() checks that no NEW number appears in the AI output.
 *   On digit mismatch → retries once.
 *   If still invalid after MAX_RETRIES → returns original bullet with confidence=30.
 *
 * Features:
 *   - 20-second timeout per call via Promise.race
 *   - Max 2 retries with exponential back-off
 *   - JSON fence stripping + strict parse
 *   - Quota (429) surfaced as ApiError
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { RewriteRequest, RewriteResponse, REWRITE_SYSTEM_PROMPT } from './schema';

const TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;
const FALLBACK_CONFIDENCE = 30;

// ── Structured error ──────────────────────────────────────────────────────────
export class ApiError extends Error {
    constructor(message: string, public readonly statusCode: number) {
        super(message);
        this.name = 'ApiError';
    }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new ApiError(`Gemini request timed out after ${ms}ms`, 504)), ms)
    );
    return Promise.race([promise, timeout]);
}

function isQuotaError(err: unknown): boolean {
    if (err instanceof Error) {
        return err.message.includes('429') || err.message.toLowerCase().includes('quota');
    }
    return false;
}

function stripJsonFences(raw: string): string {
    const m = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return m ? m[1] : raw;
}

/**
 * Extract all digit sequences from a string.
 * "Reduced latency 40% across 3 regions" → ["40", "3"]
 */
function extractDigits(text: string): Set<string> {
    return new Set((text.match(/\d+/g) ?? []));
}

/**
 * Returns true if the rewritten bullet introduces a new number
 * not present in the original bullet.
 */
function hasInventedDigits(original: string, rewritten: string): boolean {
    const origDigits = extractDigits(original);
    const rewriteDigits = extractDigits(rewritten);
    for (const d of rewriteDigits) {
        if (!origDigits.has(d)) return true;
    }
    return false;
}

// ── AI Client ─────────────────────────────────────────────────────────────────
export class AIClient {
    private readonly model;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            throw new Error('[rewrite-api] GEMINI_API_KEY is not set. Add it to your .env file.');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: REWRITE_SYSTEM_PROMPT,
        });
    }

    private async callGemini(prompt: string): Promise<RewriteResponse> {
        const genResult = await withTimeout(
            this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
            }),
            TIMEOUT_MS
        );
        const rawText = await genResult.response.text();

        const cleaned = stripJsonFences(rawText);
        let parsed: unknown;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            throw new Error(`Invalid JSON from Gemini: ${cleaned.slice(0, 200)}`);
        }

        if (
            typeof parsed !== 'object' ||
            parsed === null ||
            typeof (parsed as Record<string, unknown>).rewritten !== 'string' ||
            typeof (parsed as Record<string, unknown>).confidence !== 'number'
        ) {
            throw new Error('Gemini response missing required fields (rewritten, confidence)');
        }

        return {
            rewritten: ((parsed as Record<string, unknown>).rewritten as string).trim(),
            confidence: Math.max(0, Math.min(100, Math.round((parsed as Record<string, unknown>).confidence as number))),
        };
    }

    async rewriteBullet(req: RewriteRequest): Promise<RewriteResponse> {
        const prompt = `Original bullet: "${req.originalBullet}"
JD keywords: ${JSON.stringify(req.jdKeywords)}

Rewrite the bullet following the system rules.`;

        let lastError: Error = new Error('Unknown error');

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                const result = await this.callGemini(prompt);

                // ── Anti-fabrication check ─────────────────────────────────────────
                if (hasInventedDigits(req.originalBullet, result.rewritten)) {
                    console.warn(
                        `[rewrite-api] Hallucinated digit detected (attempt ${attempt + 1}).` +
                        ` Original: "${req.originalBullet}" → Rewritten: "${result.rewritten}"`
                    );
                    if (attempt < MAX_RETRIES) {
                        await sleep(1000 * (attempt + 1));
                        continue; // retry
                    }
                    // Final attempt still hallucinated → fallback
                    console.warn('[rewrite-api] Falling back to original bullet after digit hallucination.');
                    return { rewritten: req.originalBullet, confidence: FALLBACK_CONFIDENCE };
                }

                return result;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));

                if (isQuotaError(err)) {
                    throw new ApiError('Gemini API quota exceeded. Check your billing or wait before retrying.', 429);
                }

                if (attempt < MAX_RETRIES) {
                    const backoff = 1000 * (attempt + 1);
                    console.warn(`[rewrite-api] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${backoff}ms…`);
                    await sleep(backoff);
                }
            }
        }

        // All retries exhausted — return safe fallback
        console.warn('[rewrite-api] All retries exhausted. Returning original bullet.');
        return { rewritten: req.originalBullet, confidence: FALLBACK_CONFIDENCE };
    }
}

export const aiClient = new AIClient();
