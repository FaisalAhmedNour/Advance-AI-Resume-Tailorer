/**
 * @file services/jd-analyzer-api/src/ai.client.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * AI client for jd-analyzer-api.
 * Uses @google/generative-ai SDK with gemini-2.5-flash.
 *
 * Features:
 *   - 20-second request timeout via Promise.race
 *   - Max 2 retries with exponential back-off
 *   - JSON schema validation after each attempt
 *   - On first JSON parse failure: retries with stricter suffix prompt
 *   - Quota error (429) surfaced as structured ApiError
 *   - SHA-256 in-memory cache: same JD never costs a second API call
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { JDSchema } from '@resume-tailorer/shared';
import { JD_SYSTEM_PROMPT, JD_RETRY_PROMPT_SUFFIX } from './schema';

const TIMEOUT_MS = 20_000;
const MAX_RETRIES = 2;

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
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    return fenceMatch ? fenceMatch[1] : raw;
}

function validateAndNormalise(parsed: Record<string, unknown>): JDSchema {
    return {
        title: typeof parsed.title === 'string' ? parsed.title : null,
        seniority: (parsed.seniority as JDSchema['seniority']) ?? null,
        requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills as string[] : [],
        preferredSkills: Array.isArray(parsed.preferredSkills) ? parsed.preferredSkills as string[] : [],
        softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills as string[] : [],
        responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities as string[] : [],
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords as string[] : [],
        yearsExperience: {
            min: typeof parsed.yearsExperience === 'object' && parsed.yearsExperience !== null
                ? ((parsed.yearsExperience as { min?: unknown }).min as number | null) ?? null
                : null,
            max: typeof parsed.yearsExperience === 'object' && parsed.yearsExperience !== null
                ? ((parsed.yearsExperience as { max?: unknown }).max as number | null) ?? null
                : null,
        },
    };
}

// ── AI Client ─────────────────────────────────────────────────────────────────
export class AIClient {
    private readonly model;
    private readonly cache = new Map<string, JDSchema>();

    constructor() {
        // Docker injects GEMINI_API_KEY directly; local dev uses GEMINI_KEY_ANALYZER from root .env
        const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY_ANALYZER;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            throw new Error('[jd-analyzer-api] GEMINI_API_KEY (or GEMINI_KEY_ANALYZER) is not set. Add it to your .env file.');
        }
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: JD_SYSTEM_PROMPT,
        });
    }

    private async callGemini(prompt: string): Promise<JDSchema> {
        const genResult = await withTimeout(
            this.model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.2,
                    maxOutputTokens: 2048,
                },
            }),
            TIMEOUT_MS
        );
        const rawText = genResult.response.text();

        const cleaned = stripJsonFences(rawText);
        let parsed: unknown;
        try {
            parsed = JSON.parse(cleaned);
        } catch {
            throw new Error(`Invalid JSON from Gemini: ${cleaned?.slice(0, 200)}`);
        }

        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            throw new Error('Gemini returned a non-object JSON value');
        }

        const validJD = validateAndNormalise(parsed as Record<string, unknown>);

        if (process.env.DEBUG === 'true') {
            console.log('\n[DEBUG: jd-analyzer-api] -- JD Extraction --');
            console.log(`Tokens Used => In: ${genResult.response.usageMetadata?.promptTokenCount}, Out: ${genResult.response.usageMetadata?.candidatesTokenCount}`);
            console.log(`Keywords Found => ${validJD.keywords?.join(', ')}`);
        }

        return validJD;
    }

    async analyzeJD(jdText: string): Promise<JDSchema> {
        const hash = crypto.createHash('sha256').update(jdText).digest('hex');
        if (this.cache.has(hash)) {
            console.log('[jd-analyzer-api] Cache hit:', hash?.slice(0, 8));
            return this.cache.get(hash)!;
        }

        let lastError: Error = new Error('Unknown error');

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                // On the second attempt, append a stricter instruction to the prompt
                const prompt = attempt > 0 ? jdText + JD_RETRY_PROMPT_SUFFIX : jdText;
                const result = await this.callGemini(prompt);
                this.cache.set(hash, result);
                return result;
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));

                if (isQuotaError(err)) {
                    throw new ApiError('Gemini API quota exceeded. Check your billing or wait before retrying.', 429);
                }

                if (attempt < MAX_RETRIES) {
                    const backoff = 1000 * (attempt + 1);
                    console.warn(`[jd-analyzer-api] Attempt ${attempt + 1} failed: ${lastError.message}. Retrying in ${backoff}ms…`);
                    await sleep(backoff);
                }
            }
        }

        throw new ApiError(`Gemini extraction failed after ${MAX_RETRIES + 1} attempts: ${lastError.message}`, 502);
    }
}

// Lazy singleton — created on first request so the service boots even without GEMINI key
let _client: AIClient | null = null;
export function getAiClient(): AIClient {
    if (!_client) _client = new AIClient();
    return _client;
}
