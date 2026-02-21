export type Seniority = "intern" | "junior" | "mid" | "senior" | "lead" | "manager" | null;

export interface JDSchema {
    title: string | null;
    seniority: Seniority;
    requiredSkills: string[];
    preferredSkills: string[];
    softSkills: string[];
    responsibilities: string[];
    keywords: string[];
    yearsExperience: {
        min: number | null;
        max: number | null;
    };
}

export const JD_SYSTEM_PROMPT = `
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
`;
