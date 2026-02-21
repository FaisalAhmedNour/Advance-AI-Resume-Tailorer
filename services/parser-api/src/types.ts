export interface Education {
    institution: string;
    degree: string | null;
    start: string | null;
    end: string | null;
}

export interface Experience {
    company: string;
    role: string | null;
    start: string | null;
    end: string | null;
    bullets: string[];
}

export interface Project {
    name: string;
    description: string;
}

export interface Contact {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
}

export interface ParseResult {
    contact: Contact;
    summary: string | null;
    education: Education[];
    experience: Experience[];
    skills: string[];
    projects: Project[];
}
