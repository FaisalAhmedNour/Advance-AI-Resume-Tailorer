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

// Re-export prompts from the shared templates file.
// Switch between 'full' (default) and 'short' (free-tier) via PROMPT_VARIANT env var.
export { REWRITE_SYSTEM_PROMPT, EXPLAIN_SYSTEM_PROMPT } from '../../shared/prompt-templates.js';
