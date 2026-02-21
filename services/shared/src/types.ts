/**
 * @file services/shared/src/types.ts
 * Strict Data Contracts for the AI Resume Tailoring Pipeline.
 */

export interface ContactInfo {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
}

export interface Education {
    institution: string | null;
    degree: string | null;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
}

export interface ExperienceEntry {
    company: string | null;
    role: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    bullets: string[];
}

export interface Project {
    name: string | null;
    description: string | null;
    technologies: string[];
    url: string | null;
}

export interface Skills {
    languages: string[];
    frameworks: string[];
    tools: string[];
    other: string[];
}

export interface ResumeSchema {
    contact: ContactInfo;
    summary: string | null;
    experience: ExperienceEntry[];
    education: Education[];
    projects: Project[];
    skills: Skills;
}

export interface JDSchema {
    title: string | null;
    seniority: string | null;
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

export interface RewriteRequest {
    originalBullet: string;
    jdKeywords: string[];
}

export interface RewriteResponseSchema {
    rewritten: string;
    confidence: number;
    explanation: string;
    insertedKeywords: string[];
    improvementScore: number;
}

export interface ScoreBreakdown {
    requiredCoverage: number;
    preferredCoverage: number;
    keywordCoverage: number;
    semanticSimilarity: number;
}

export interface ScoreResponseSchema {
    overallScore: number;
    beforeScore: number;
    breakdown: ScoreBreakdown;
    matchedRequired: string[];
    matchedPreferred: string[];
    missingRequired: string[];
}
