import { GoogleGenAI } from '@google/genai';
import pLimit from 'p-limit';
import crypto from 'crypto';
import { RewriteRequest, RewriteResponse, REWRITE_SYSTEM_PROMPT, ExplainRequest, ExplainResponse, EXPLAIN_SYSTEM_PROMPT } from './schema.js';

export class AIClient {
    private ai: GoogleGenAI;

    // Rate limiter: Max 3 concurrent LLM rewrite requests locally
    private limit = pLimit(3);
    private explainCache = new Map<string, string>();

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'test-key' });
    }

    private hashPayload(req: ExplainRequest): string {
        const raw = `${req.originalBullet}|${req.rewrittenBullet}|${req.jdKeywords.join(',')}`;
        return crypto.createHash('sha256').update(raw).digest('hex');
    }

    /**
     * Extracts solely digit characters from a string.
     */
    private extractDigits(text: string): string[] {
        if (!text) return [];
        const matches = text.match(/\d+/g);
        return matches ? matches : [];
    }

    /**
     * Generates a safe programmatic fallback if validation fails.
     */
    private generateFallback(req: RewriteRequest): RewriteResponse {
        // Simple template: "Executed [role] tasks at [company] including [originalBullet]"
        const safeAction = req.originalBullet.trim() || 'Contributed to operations';
        let rewritten = safeAction;

        // Ensuring it starts cleanly
        if (/^[a-zA-Z]/.test(rewritten)) {
            rewritten = rewritten.charAt(0).toUpperCase() + rewritten.slice(1);
        }

        return {
            rewritten: rewritten,
            explanation: "Fallback applied due to safety constraints.",
            confidence: 20
        };
    }

    private verifyNoHallucinations(req: RewriteRequest, res: RewriteResponse): boolean {
        if (!res.rewritten) return false;

        const originalDigits = new Set([
            ...this.extractDigits(req.originalBullet),
            ...this.extractDigits(req.resumeContext.company),
            ...this.extractDigits(req.resumeContext.role),
            ...this.extractDigits(req.resumeContext.dates),
            ...req.resumeContext.otherBullets.flatMap(b => this.extractDigits(b))
        ]);

        const newDigits = this.extractDigits(res.rewritten);

        // Check if AI invented a number not present in the provided context
        for (const num of newDigits) {
            if (!originalDigits.has(num)) {
                console.warn(`[REWRITE DETECTED HALLUCINATION]: Invented number '${num}' in rewriting '${req.originalBullet}'`);
                return false; // Fails strict constraint
            }
        }

        return true;
    }

    private async executeGenerate(req: RewriteRequest): Promise<RewriteResponse> {
        const payload = JSON.stringify(req, null, 2);

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { role: 'user', parts: [{ text: payload }] }
                ],
                config: {
                    systemInstruction: REWRITE_SYSTEM_PROMPT,
                    responseMimeType: 'application/json'
                }
            });

            const rawJson = response.text;
            if (!rawJson) throw new Error("Empty AI response");

            let parsed: any;
            try {
                parsed = JSON.parse(rawJson);
            } catch (e) {
                const match = rawJson.match(/```json\n([\s\S]*?)\n```/);
                if (match) parsed = JSON.parse(match[1]);
                else throw new Error("Failed to parse JSON schema");
            }

            const generated: RewriteResponse = {
                rewritten: parsed.rewritten || req.originalBullet,
                explanation: parsed.explanation || "",
                confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0
            };

            // strict local verification
            if (!this.verifyNoHallucinations(req, generated)) {
                return this.generateFallback(req);
            }

            return generated;
        } catch (err: any) {
            console.error('Rewrite AI Error:', err);
            return this.generateFallback(req);
        }
    }

    public async rewriteBullet(req: RewriteRequest): Promise<RewriteResponse> {
        if (!req.originalBullet || req.originalBullet.trim() === '') {
            throw new Error("originalBullet cannot be empty");
        }

        // Pass the execution into the concurrency throttler.
        return this.limit(() => this.executeGenerate(req));
    }

    public async generateExplanation(req: ExplainRequest): Promise<ExplainResponse> {
        if (!req.originalBullet || !req.rewrittenBullet) {
            throw new Error("Both original and rewritten bullets are required.");
        }

        const hashId = this.hashPayload(req);
        if (this.explainCache.has(hashId)) {
            return { rationale: this.explainCache.get(hashId)! };
        }

        const payload = JSON.stringify(req, null, 2);

        try {
            const response = await this.limit(async () => {
                return await this.ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [{ role: 'user', parts: [{ text: payload }] }],
                    config: { systemInstruction: EXPLAIN_SYSTEM_PROMPT, responseMimeType: 'application/json' }
                });
            });

            const rawJson = response.text;
            if (!rawJson) throw new Error("Empty explanation");

            let parsed: any;
            try {
                parsed = JSON.parse(rawJson);
            } catch (e) {
                const match = rawJson.match(/```json\n([\s\S]*?)\n```/);
                if (match) parsed = JSON.parse(match[1]);
                else throw new Error("Failed JSON parsing for explain");
            }

            const rationale = parsed.rationale || "Rewritten to better align with requested metrics and required keywords.";

            this.explainCache.set(hashId, rationale);
            return { rationale };

        } catch (err: any) {
            console.error('Explanation AI Error:', err);
            return { rationale: "Rewritten to feature stronger context matching the job description constraints." };
        }
    }
}

export const aiClient = new AIClient();
