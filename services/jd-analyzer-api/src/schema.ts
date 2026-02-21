/**
 * @file services/jd-analyzer-api/src/schema.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 */

export type Seniority = 'intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'manager' | null;

export interface JDSchema {
  title: string | null;
  seniority: Seniority;
  requiredSkills: string[];
  preferredSkills: string[];
  softSkills: string[];
  responsibilities: string[];
  keywords: string[];
  yearsExperience: { min: number | null; max: number | null };
}

export const JD_SYSTEM_PROMPT = `You are an ATS job-description JSON extractor. Return ONLY valid JSON matching the schema below. No explanation, no markdown, no code fences — raw JSON only.

SCHEMA:
{
  "title": "string or null",
  "seniority": "intern|junior|mid|senior|lead|manager or null",
  "requiredSkills": ["array of strings"],
  "preferredSkills": ["array of strings"],
  "softSkills": ["array of strings"],
  "responsibilities": ["array of strings"],
  "keywords": ["array of notable ATS keywords"],
  "yearsExperience": { "min": number_or_null, "max": number_or_null }
}

Rules:
- Use null for unknown values.
- Do not invent data not present in the job description.
- requiredSkills: skills explicitly marked required / must-have.
- preferredSkills: skills marked nice-to-have / bonus.
- keywords: significant technical terms from the JD useful for ATS matching.`;

export const JD_RETRY_PROMPT_SUFFIX = '\n\nReturn strictly valid JSON. No explanation. No markdown. Just the raw JSON object.';
