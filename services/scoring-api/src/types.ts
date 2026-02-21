/**
 * @file services/scoring-api/src/types.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 */

export interface ScoreRequest {
    originalResume: ResumeData;
    tailoredResume: ResumeData;
    jd: JDData;
}

export interface ResumeData {
    skills?: {
        languages?: string[];
        frameworks?: string[];
        tools?: string[];
        other?: string[];
    };
    experience?: Array<{ bullets?: string[]; role?: string; company?: string }>;
    education?: Array<{ degree?: string; field?: string }>;
    summary?: string | null;
}

export interface JDData {
    requiredSkills?: string[];
    preferredSkills?: string[];
    keywords?: string[];
    responsibilities?: string[];
    yearsExperience?: { min?: number | null; max?: number | null };
}

export interface ScoreBreakdown {
    keywordScore: number;
    skillScore: number;
    experienceScore: number;
    densityScore: number;
}

export interface ScoreResponse {
    originalScore: number;
    tailoredScore: number;
    improvement: number;
    breakdown: ScoreBreakdown;
}
