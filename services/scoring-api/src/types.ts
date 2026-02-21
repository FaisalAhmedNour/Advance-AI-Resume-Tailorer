/**
 * @file services/scoring-api/src/types.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 */

export interface ScoreRequest {
    resumeData: ResumeData;
    jdData: JDData;
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
    requiredCoverage: number; // 0–1
    preferredCoverage: number; // 0–1
    keywordCoverage: number; // 0–1
    semanticSimilarity: number; // 0–1 (Jaccard)
}

export interface ScoreResponse {
    overallScore: number; // 0–100
    beforeScore: number; // same as overallScore (for pipeline compatibility)
    breakdown: ScoreBreakdown;
    matchedRequired: string[];
    matchedPreferred: string[];
    missingRequired: string[];
}
