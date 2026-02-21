/**
 * @file services/parser-api/src/parser.service.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * Deterministic regex-based résumé parser. No AI usage.
 * Parses plain text résumés into a strongly-typed ResumeSchema.
 */

import { ResumeSchema, ContactInfo, ExperienceEntry, Education, Project, Skills } from './types';

// ── Section heading patterns ──────────────────────────────────────────────────
const SECTION_PATTERNS: Record<string, RegExp> = {
    experience: /^(experience|work\s+experience|employment|professional\s+experience)/i,
    education: /^(education|academic|qualification)/i,
    skills: /^(skills|technical\s+skills|core\s+competencies|technologies)/i,
    projects: /^(projects|personal\s+projects|side\s+projects|portfolio)/i,
    summary: /^(summary|objective|profile|about\s+me)/i,
};

// ── Field extraction patterns ─────────────────────────────────────────────────
const EMAIL_RE = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/;
const PHONE_RE = /(\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[\w\-_%]+/i;
const GITHUB_RE = /github\.com\/[\w\-]+/i;
const URL_RE = /https?:\/\/[^\s,)]+/i;
const GPA_RE = /gpa:\s*([0-9.]+)/i;

const DATE_RANGE_RE = /([A-Za-z]+\.?\s+\d{4}|present|current|\d{4})\s*[–—\-]{1,2}\s*([A-Za-z]+\.?\s+\d{4}|present|current|\d{4})/i;
const DATE_YEAR_RE = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4}|\b\d{4}\b/i;

const DEGREE_RE = /(B\.?S\.?|M\.?S\.?|Ph\.?D\.?|B\.?A\.?|M\.?A\.?|Bachelor|Master|Doctor|Associate)[^,\n]*/i;

const BULLET_STARTERS = /^[\-•◦▪▸\*\u2022\u25B8]/;

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractFirst(text: string, re: RegExp): string | null {
    const m = text.match(re);
    return m ? m[0].trim() : null;
}

function splitLines(text: string): string[] {
    return text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
}

function isSectionHeading(line: string): string | null {
    const clean = line.replace(/[:.\-]+$/, '').trim();
    for (const [name, pattern] of Object.entries(SECTION_PATTERNS)) {
        if (pattern.test(clean) && clean.split(/\s+/).length <= 5) {
            return name;
        }
    }
    return null;
}

function extractBullets(lines: string[]): string[] {
    return lines
        .filter(l => BULLET_STARTERS.test(l) || l.match(/^[A-Z][a-z]+ed |^[A-Z][a-z]+ed,/))
        .map(l => l.replace(/^[\-•◦▪▸\*\u2022\u25B8]\s*/, '').trim())
        .filter(l => l.length > 15);
}

function extractDateRange(text: string): { startDate: string | null; endDate: string | null; isCurrent: boolean } {
    const m = text.match(DATE_RANGE_RE);
    if (!m) {
        const yearM = text.match(DATE_YEAR_RE);
        return { startDate: yearM ? yearM[0] : null, endDate: null, isCurrent: false };
    }
    const endRaw = m[2].toLowerCase();
    const isCurrent = /present|current/i.test(endRaw);
    return {
        startDate: m[1],
        endDate: isCurrent ? null : m[2],
        isCurrent,
    };
}

function extractSkillList(text: string): string[] {
    return text
        .split(/[,;|\/\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && s.length < 50);
}

// ── Contact parser ────────────────────────────────────────────────────────────
function parseContact(lines: string[]): ContactInfo {
    const headerBlock = lines.slice(0, Math.min(10, lines.length)).join('\n');

    // Name heuristic: first non-empty line that is NOT an email/phone/URL
    const nameLine = lines.find(l =>
        !EMAIL_RE.test(l) &&
        !PHONE_RE.test(l) &&
        !LINKEDIN_RE.test(l) &&
        !GITHUB_RE.test(l) &&
        !URL_RE.test(l) &&
        l.split(/\s+/).length <= 5 &&
        l.length >= 3
    ) ?? 'Unknown';

    return {
        name: nameLine,
        email: extractFirst(headerBlock, EMAIL_RE),
        phone: extractFirst(headerBlock, PHONE_RE),
        location: null,
        linkedin: extractFirst(headerBlock, LINKEDIN_RE),
        github: extractFirst(headerBlock, GITHUB_RE),
        portfolio: extractFirst(headerBlock, URL_RE),
    };
}

// ── Experience parser ─────────────────────────────────────────────────────────
interface ExperienceAccumulator {
    company: string | null;
    role: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    bulletLines: string[];
}

function parseExperienceBlock(block: string[]): ExperienceEntry[] {
    const entries: ExperienceEntry[] = [];
    let current: ExperienceAccumulator | null = null;

    for (const line of block) {
        const dateInfo = extractDateRange(line);
        const hasDates = DATE_RANGE_RE.test(line) || DATE_YEAR_RE.test(line);

        // Heuristic: lines with dates and ROLE-like words start a new entry
        if (hasDates && !BULLET_STARTERS.test(line) && line.split(/\s+/).length <= 12) {
            if (current) {
                entries.push({
                    company: current.company ?? 'Unknown Company',
                    role: current.role ?? 'Unknown Role',
                    location: current.location ?? null,
                    startDate: current.startDate ?? null,
                    endDate: current.endDate ?? null,
                    isCurrent: current.isCurrent ?? false,
                    bullets: extractBullets(current.bulletLines),
                });
            }
            current = {
                company: null,
                role: null,
                location: null,
                ...dateInfo,
                bulletLines: [],
            };
            // Strip the date portion to find role/company
            const stripped = line.replace(DATE_RANGE_RE, '').replace(DATE_YEAR_RE, '').trim();
            const parts = stripped.split(/[,—–\-]{1,2}|\s{2,}/);
            const rolePart = parts[0]?.trim();
            const companyPart = parts[1]?.trim();
            if (rolePart) current.role = rolePart;
            if (companyPart) current.company = companyPart;
        } else if (current) {
            if (!current.company && !BULLET_STARTERS.test(line) && line.length < 80) {
                current.company = line;
            } else {
                current.bulletLines.push(line);
            }
        }
    }

    if (current) {
        entries.push({
            company: current.company ?? 'Unknown Company',
            role: current.role ?? 'Unknown Role',
            location: current.location ?? null,
            startDate: current.startDate ?? null,
            endDate: current.endDate ?? null,
            isCurrent: current.isCurrent ?? false,
            bullets: extractBullets(current.bulletLines),
        });
    }

    return entries;
}

// ── Education parser ──────────────────────────────────────────────────────────
function parseEducationBlock(block: string[]): Education[] {
    const entries: Education[] = [];
    let current: Partial<Education> | null = null;

    for (const line of block) {
        const hasDates = DATE_RANGE_RE.test(line) || DATE_YEAR_RE.test(line);

        if (!BULLET_STARTERS.test(line) && line.length > 3) {
            if (hasDates || (current && !current.degree)) {
                if (!current) current = {};

                const degM = line.match(DEGREE_RE);
                if (degM) {
                    if (entries.length > 0 || current.institution) {
                        if (current.institution) {
                            entries.push({
                                institution: current.institution ?? 'Unknown',
                                degree: current.degree ?? null,
                                field: current.field ?? null,
                                startDate: current.startDate ?? null,
                                endDate: current.endDate ?? null,
                                gpa: current.gpa ?? null,
                            });
                        }
                        current = {};
                    }
                    current.degree = degM[0].trim();
                }

                const gpaM = line.match(GPA_RE);
                if (gpaM) current.gpa = gpaM[1];

                const dates = extractDateRange(line);
                if (dates.startDate) {
                    current.startDate = dates.startDate;
                    current.endDate = dates.endDate;
                }

                const stripped = line.replace(DEGREE_RE, '').replace(DATE_RANGE_RE, '').replace(GPA_RE, '').trim();
                if (!current.institution && stripped.length > 2) {
                    current.institution = stripped.replace(/[,.\-]+$/, '').trim();
                }
            } else if (!current) {
                current = { institution: line };
            }
        }
    }

    if (current?.institution) {
        entries.push({
            institution: current.institution,
            degree: current.degree ?? null,
            field: current.field ?? null,
            startDate: current.startDate ?? null,
            endDate: current.endDate ?? null,
            gpa: current.gpa ?? null,
        });
    }

    return entries;
}

// ── Skills parser ─────────────────────────────────────────────────────────────
function parseSkillsBlock(block: string[]): Skills {
    const skills: Skills = { languages: [], frameworks: [], tools: [], other: [] };
    const LANG_KEYWORDS = /^(languages?|programming)/i;
    const FRAMEWORK_KW = /^(frameworks?|libraries|frontend|backend)/i;
    const TOOLS_KW = /^(tools?|platforms?|devops|cloud|databases?|infra)/i;

    for (const line of block) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0 && colonIdx < 30) {
            const label = line.slice(0, colonIdx).toLowerCase();
            const value = line.slice(colonIdx + 1);
            const items = extractSkillList(value);
            if (LANG_KEYWORDS.test(label)) skills.languages.push(...items);
            else if (FRAMEWORK_KW.test(label)) skills.frameworks.push(...items);
            else if (TOOLS_KW.test(label)) skills.tools.push(...items);
            else skills.other.push(...items);
        } else {
            skills.other.push(...extractSkillList(line));
        }
    }

    return skills;
}

// ── Projects parser ───────────────────────────────────────────────────────────
function parseProjectsBlock(block: string[]): Project[] {
    const projects: Project[] = [];
    let current: Partial<Project> & { descLines: string[] } | null = null;

    for (const line of block) {
        if (!BULLET_STARTERS.test(line) && line.length < 80 && !URL_RE.test(line)) {
            if (current) {
                projects.push({
                    name: current.name ?? 'Project',
                    description: current.descLines.join(' ').trim(),
                    technologies: current.technologies ?? [],
                    url: current.url ?? null,
                });
            }
            current = { name: line, descLines: [], technologies: [], url: null };
        } else if (current) {
            const urlM = line.match(URL_RE);
            if (urlM) { current.url = urlM[0]; continue; }
            current.descLines.push(line.replace(BULLET_STARTERS, '').trim());
        }
    }

    if (current?.name) {
        projects.push({
            name: current.name,
            description: current.descLines.join(' ').trim(),
            technologies: current.technologies ?? [],
            url: current.url ?? null,
        });
    }

    return projects;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function parseResume(text: string): ResumeSchema {
    const lines = splitLines(text);

    // Bucket lines into sections
    const sections: Record<string, string[]> = {
        header: [],
        experience: [],
        education: [],
        skills: [],
        projects: [],
        summary: [],
    };

    let currentSection = 'header';

    for (const line of lines) {
        const detected = isSectionHeading(line);
        if (detected) {
            currentSection = detected;
        } else {
            sections[currentSection].push(line);
        }
    }

    return {
        contact: parseContact(sections.header),
        summary: sections.summary.join(' ').trim() || null,
        experience: parseExperienceBlock(sections.experience),
        education: parseEducationBlock(sections.education),
        projects: parseProjectsBlock(sections.projects),
        skills: parseSkillsBlock(sections.skills),
    };
}
