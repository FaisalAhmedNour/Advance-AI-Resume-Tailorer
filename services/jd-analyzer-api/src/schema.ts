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

// Re-export the JD extractor prompt from the shared templates file.
// Switch between 'full' (default) and 'short' (free-tier) via PROMPT_VARIANT env var.
export { JD_SYSTEM_PROMPT } from '../../shared/prompt-templates.js';
