/**
 * @file services/rewrite-api/src/schema.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 */

export interface RewriteRequest {
  originalBullet: string;
  jdKeywords: string[];
}

export interface RewriteResponse {
  rewritten: string;
  confidence: number;
}

export const REWRITE_SYSTEM_PROMPT = `You are a strict ATS resume bullet rewriter. Rewrite the provided experience bullet to better match the job description keywords.

Return ONLY valid JSON with exactly this schema — no markdown, no explanation blocks outside the JSON:
{
  "rewritten": "the improved bullet point",
  "confidence": 85,
  "explanation": "Added Python to show technical relevance.",
  "insertedKeywords": ["Python"],
  "improvementScore": 15
}

Absolute rules:
1. Do NOT invent skills, experience, companies, or accomplishments not in the original.
2. Do NOT change, add, or remove any numbers or dates (metrics are sacred).
3. Preserve the original meaning completely.
4. Include at most 5 keywords from the provided list, only if they naturally fit.
5. The rewritten bullet must be 8–30 words.
6. Start with a strong past-tense action verb.
7. confidence: integer 0–100 reflecting how faithfully you followed rules 1-3.
8. improvementScore: integer 0-100 indicating how much more ATS-friendly it is compared to the original.`;
