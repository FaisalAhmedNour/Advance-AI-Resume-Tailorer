/**
 * @file services/parser-api/src/types.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 */

export interface ContactInfo {
    name: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
}

export interface Education {
    institution: string;
    degree: string | null;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
}

export interface ExperienceEntry {
    company: string;
    role: string;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    bullets: string[];
}

export interface Project {
    name: string;
    description: string;
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
