// Mirrored types from parser & jd-analyzer for payload strictness

export interface ResumeSchema {
    contact: {
        name: string | null;
        email: string | null;
        phone: string | null;
        location: string | null;
        linkedin: string | null;
        github: string | null;
        portfolio: string | null;
    };
    education: Array<{
        institution: string | null;
        degree: string | null;
        field: string | null;
        graduationDate: string | null;
        gpa: string | null;
    }>;
    experience: Array<{
        company: string | null;
        role: string | null;
        location: string | null;
        startDate: string | null;
        endDate: string | null;
        isCurrent: boolean;
        bullets: string[];
    }>;
    projects: Array<{
        title: string | null;
        description: string | null;
        technologies: string[];
        link: string | null;
    }>;
    skills: {
        languages: string[];
        frameworks: string[];
        tools: string[];
        softSkills: string[];
    };
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

export interface RewrittenBullet {
    original: string;
    rewritten: string;
}

export interface ScoreRequest {
    originalResume: ResumeSchema;
    tailoredResume: ResumeSchema;
    jd: JDSchema;
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
