export interface ResumeContext {
    company: string;
    role: string;
    dates: string;
    otherBullets: string[];
}

export interface RewriteRequest {
    originalBullet: string;
    resumeContext: ResumeContext;
    jdKeywords: string[];
}

export interface RewriteResponse {
    rewritten: string;
    explanation: string;
    confidence: number;
}

export interface ExplainRequest {
    originalBullet: string;
    rewrittenBullet: string;
    jdKeywords: string[];
}

export interface ExplainResponse {
    rationale: string;
}

export const EXPLAIN_SYSTEM_PROMPT = `
Explain in one sentence (<=30 words) why the rewritten bullet better matches the job description, and list which keywords were used. Return only the sentence as plain text or JSON { "rationale": "..." }.
`;

export const REWRITE_SYSTEM_PROMPT = `
You are a strict ATS Resume Optimizer. Rewriting a single experience bullet based on provided Job Description keywords.
ALWAYS RETURN VALID JSON EXACTLY MATCHING THIS SCHEMA:
{
  "rewritten": "...",
  "explanation": "...",
  "confidence": 100
}

CRITICAL RULES:
1. NEVER add facts, metrics, skills, or responsibilities not present in the originalBullet or resumeContext. If you must, refuse changes by returning rewritten == originalBullet and confidence <= 20.
2. DO NOT invent, remove, or change numbers, dates, or proper names.
3. Include at most 2 additional keywords from jdKeywords ONLY IF they logically fit existing facts. Do not force them.
4. Keep the final bullet length between 8 and 28 words.
5. Start with a strong action verb. Use past tense for previous positions and present tense for current roles (infer from dates).
6. Provide a concise, 1-sentence explanation of why the rewrite is better.
7. Score confidence 0-100 based on how well you followed these rules without hallucinations.
`;
