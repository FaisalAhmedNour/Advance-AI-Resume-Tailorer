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
    graduationDate: string | null;
    gpa: string | null;
}

export interface Experience {
    company: string | null;
    role: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    bullets: string[];
}

export interface Project {
    title: string | null;
    description: string | null;
    technologies: string[];
    link: string | null;
}

export interface Skills {
    languages: string[];
    frameworks: string[];
    tools: string[];
    softSkills: string[];
}

export interface ResumeSchema {
    contact: ContactInfo;
    education: Education[];
    experience: Experience[];
    projects: Project[];
    skills: Skills;
}

export type TemplateId = 'modern' | 'classic';

export interface ExportRequest {
    tailoredResume: ResumeSchema;
    template: TemplateId;
}
