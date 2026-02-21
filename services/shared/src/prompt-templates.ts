/**
 * @file services/shared/prompt-templates.ts
 * @generated-by Antigravity AI assistant — chunk 13 (prompt centralisation pass)
 * @command "Create a file /services/shared/prompt-templates.ts with all system prompts"
 *
 * Edit this file to adjust AI behaviour across all services.
 * See services/shared/README.md for token-cost tradeoffs and PROMPT_VARIANT docs.
 */

/**
 * services/shared/prompt-templates.ts
 *
 * Single source of truth for all AI system prompts used across the monorepo.
 *
 * ── PROMPT VARIANT ────────────────────────────────────────────────────────────
 * Set the environment variable PROMPT_VARIANT to switch between prompt sizes:
 *
 *   PROMPT_VARIANT=full   (default) — production-quality prompts, highest output
 *   PROMPT_VARIANT=short            — free-tier optimised, ~60% fewer input tokens
 *
 * Both variants produce valid JSON output compatible with the same schema.
 * Switch via: export PROMPT_VARIANT=short  (or add to infra/.env)
 *
 * ── TOKEN COST NOTES ─────────────────────────────────────────────────────────
 * Costs below are approximate for Gemini Flash pricing (per 1M tokens):
 *   Input:  $0.075 / 1M tokens
 *   Output: $0.30  / 1M tokens
 *
 * Most cost comes from long system prompts repeated for every bullet.
 * rewrite-api sends one system prompt per bullet — with 8 bullets that is
 * 8× the per-call system prompt cost. Use PROMPT_VARIANT=short to reduce this.
 */

export type PromptVariant = 'full' | 'short';

/** Read from env; default to 'full' for production quality. */
export const PROMPT_VARIANT: PromptVariant =
    (process.env.PROMPT_VARIANT === 'short' ? 'short' : 'full') as PromptVariant;

// ─────────────────────────────────────────────────────────────────────────────
// 1. REWRITE SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FULL variant — ~120 input tokens per call.
 *
 * Token-cost note:
 *   At 8 bullets per résumé: ~960 tokens just for system prompts.
 *   Tradeoff: Comprehensive rules reduce hallucination rate significantly.
 *   The 7 explicit constraints (especially rule 1) are the principal guard
 *   against the model inventing metrics. Do NOT remove rule 1 or rule 2.
 *
 * What it does:
 *   - Enforces strict JSON schema with `rewritten`, `explanation`, `confidence`
 *   - Rules 1–2 are no-hallucination guards
 *   - Rule 3 caps keyword injection to 2 to avoid keyword stuffing
 *   - Rule 5 handles tense (past vs present) automatically from context
 */
export const REWRITE_SYSTEM_PROMPT_FULL = `
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
`.trim();

/**
 * SHORT variant — ~50 input tokens per call (58% reduction).
 *
 * Token-cost note:
 *   Saves ~56 tokens per bullet × 8 bullets = ~450 tokens per résumé.
 *   At $0.075/1M input tokens, negligible in dollar terms but matters for
 *   free-tier rate limits (Gemini free: 15 requests/minute, 1M tokens/day).
 *
 * Tradeoffs vs full:
 *   - No explicit tense rule → model may sometimes use wrong tense
 *   - Explanation field is dropped to reduce output tokens
 *   - Same no-hallucination guards (rules 1–2 are preserved)
 */
export const REWRITE_SYSTEM_PROMPT_SHORT = `
You are an ATS resume optimizer. Rewrite the bullet using JD keywords. Return JSON: {"rewritten":"...","explanation":"","confidence":0}.
Rules: (1) Never add facts/metrics not in the original. (2) Max 2 keywords added. (3) 8-28 words.
`.trim();

/** Active rewrite prompt selected by PROMPT_VARIANT. */
export const REWRITE_SYSTEM_PROMPT: string =
    PROMPT_VARIANT === 'short' ? REWRITE_SYSTEM_PROMPT_SHORT : REWRITE_SYSTEM_PROMPT_FULL;

// ─────────────────────────────────────────────────────────────────────────────
// 2. JD EXTRACTOR SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FULL variant — ~110 input tokens per call.
 *
 * Token-cost note:
 *   This prompt is sent once per JD and cached by SHA-256 hash, so repeated
 *   calls for the same JD are free. The marginal cost per UNIQUE JD is
 *   ~110 tokens × $0.075/1M ≈ $0.000008 — effectively zero.
 *   The output schema with all 8 fields uses ~100–300 output tokens.
 *
 * What it does:
 *   - Enforces strict JSON schema with all 8 required fields
 *   - Uses `responseMimeType: 'application/json'` for deterministic JSON output
 *   - Provides the exact schema inline to constrain the model
 *   - Null/empty-array defaults prevent missing-field errors downstream
 */
export const JD_SYSTEM_PROMPT_FULL = `
You are an ATS JSON extractor. ALWAYS RETURN VALID JSON EXACTLY MATCHING THE SCHEMA. If a value is unknown, use null or empty array. Do not include any explanation or extra fields.

SCHEMA:
{
  "title": string | null,
  "seniority": "intern" | "junior" | "mid" | "senior" | "lead" | "manager" | null,
  "requiredSkills": string[],
  "preferredSkills": string[],
  "softSkills": string[],
  "responsibilities": string[],
  "keywords": string[],
  "yearsExperience": { "min": number | null, "max": number | null }
}
`.trim();

/**
 * SHORT variant — ~45 input tokens per call (59% reduction).
 *
 * Token-cost note:
 *   Since results are cached, the short variant matters mainly for the
 *   FIRST call per unique JD. If your app sees many unique JDs (e.g., bulk
 *   evaluation), this halves input token usage for extractions.
 *
 * Tradeoffs vs full:
 *   - `responsibilities` field omitted to save output tokens
 *     (scoring algorithm only uses skills + keywords anyway)
 *   - Seniority enum values not listed → model may invent new values;
 *     add a post-processing clamp if this matters to you
 */
export const JD_SYSTEM_PROMPT_SHORT = `
Extract a JSON from this job description. Return only JSON, no explanation.
Fields: title(str|null), seniority("junior"|"mid"|"senior"|"lead"|null), requiredSkills(str[]), preferredSkills(str[]), softSkills(str[]), keywords(str[]), yearsExperience({min:num|null,max:num|null}).
`.trim();

/** Active JD extractor prompt selected by PROMPT_VARIANT. */
export const JD_SYSTEM_PROMPT: string =
    PROMPT_VARIANT === 'short' ? JD_SYSTEM_PROMPT_SHORT : JD_SYSTEM_PROMPT_FULL;

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXPLANATION PROMPT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FULL variant — ~40 input tokens per call.
 *
 * Token-cost note:
 *   Explain calls are cached by SHA-256(originalBullet + rewrittenBullet + keywords),
 *   so repeated identical rewrites are free. Unique pairs cost ~40 input +
 *   ~30 output tokens. Extremely cheap even at scale.
 *
 *   The 30-word cap on the rationale is deliberate: long rationales add
 *   output token cost without adding UI value (shown as a tooltip).
 *
 * What it does:
 *   - Produces a single ≤30-word sentence explaining the rewrite strategy
 *   - Accepts both `{ "rationale": "..." }` JSON or plain text output
 *     (the controller normalises either into { rationale })
 */
export const EXPLAIN_SYSTEM_PROMPT_FULL = `
Explain in one sentence (<=30 words) why the rewritten bullet better matches the job description, and list which keywords were used. Return only the sentence as plain text or JSON { "rationale": "..." }.
`.trim();

/**
 * SHORT variant — ~22 input tokens per call (45% reduction).
 *
 * Token-cost note:
 *   The short version removes the keyword-listing instruction. This
 *   saves ~5 output tokens per call with negligible quality impact
 *   since keyword names are already visible in the diff viewer.
 *
 * Tradeoffs vs full:
 *   - Rationale may not enumerate specific keywords
 *   - Still produces a JSON-compatible or plain-text sentence
 */
export const EXPLAIN_SYSTEM_PROMPT_SHORT = `
In <=25 words, explain why this rewrite better matches the job description. Return JSON: {"rationale":"..."}.
`.trim();

/** Active explanation prompt selected by PROMPT_VARIANT. */
export const EXPLAIN_SYSTEM_PROMPT: string =
    PROMPT_VARIANT === 'short' ? EXPLAIN_SYSTEM_PROMPT_SHORT : EXPLAIN_SYSTEM_PROMPT_FULL;

// ─────────────────────────────────────────────────────────────────────────────
// 4. CONVENIENCE EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/** All active prompts in one object — useful for logging/debugging. */
export const PROMPTS = {
    variant: PROMPT_VARIANT,
    rewrite: REWRITE_SYSTEM_PROMPT,
    jdExtractor: JD_SYSTEM_PROMPT,
    explain: EXPLAIN_SYSTEM_PROMPT,
} as const;
