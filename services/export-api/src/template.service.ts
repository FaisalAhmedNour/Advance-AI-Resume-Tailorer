/**
 * @file services/export-api/src/template.service.ts
 * @generated-by Antigravity AI assistant — chunk 9 (export-api implementation)
 * @command "Create the export-api HTML template rendering service"
 *
 * No AI used — deterministic token replacement ({{TOKEN}} placeholders).
 * Safe null-handling for all optional resume fields.
 * Reads HTML templates from the adjacent templates/ directory.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TemplateId } from './schema.js';
import { ResumeSchema } from '@resume-tailorer/shared';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

// Safely convert nullable to empty string
const s = (val: string | null | undefined): string => val ?? '';
const list = (arr: string[] | undefined): string => (arr ?? []).join(', ');

function buildExperienceHtml(experience: ResumeSchema['experience']): string {
    if (!experience || !Array.isArray(experience)) return '';
    return experience.map(exp => {
        const dates = exp.isCurrent
            ? `${s(exp.startDate)} – Present`
            : `${s(exp.startDate)} – ${s(exp.endDate)}`;
        const bullets = (exp.bullets || []).map(b => `<li>${b}</li>`).join('\n');
        return `
            <div class="exp-item">
                <div class="exp-header">
                    <span class="exp-role">${s(exp.role)}</span>
                    <span class="exp-dates">${dates}</span>
                </div>
                <div class="exp-company">${s(exp.company)}${exp.location ? ` &bull; ${exp.location}` : ''}</div>
                <ul class="bullets">${bullets}</ul>
            </div>`;
    }).join('\n');
}

function buildEducationHtml(education: ResumeSchema['education']): string {
    if (!education || !Array.isArray(education)) return '';
    return education.map((edu: any) => `
        <div class="edu-item">
            <div class="edu-header">
                <span class="edu-inst">${s(edu.institution)}</span>
                <span class="edu-date">${s(edu.endDate || edu.graduationDate)}</span>
            </div>
            <div class="edu-degree">${s(edu.degree)}${edu.field ? ` in ${edu.field}` : ''}${edu.gpa ? ` &mdash; GPA: ${edu.gpa}` : ''}</div>
        </div>`).join('\n');
}

function buildProjectsHtml(projects: ResumeSchema['projects']): string {
    if (!projects || !Array.isArray(projects) || projects.length === 0) return '';
    const items = projects.map((p: any) => `
        <div class="proj-item">
            <span class="proj-title">${s(p.title || p.name)}</span>
            ${p.link || p.url ? `<a href="${p.link || p.url}" class="proj-link">${p.link || p.url}</a>` : ''}
            <p class="proj-desc">${s(p.description)}</p>
            ${p.technologies?.length ? `<div class="proj-tech">${p.technologies.join(' &bull; ')}</div>` : ''}
        </div>`).join('\n');
    return `<div class="projects-section">${items}</div>`;
}

export function renderTemplate(resume: ResumeSchema, templateId: TemplateId): string {
    const templatePath = join(TEMPLATES_DIR, `${templateId}.html`);
    let html = readFileSync(templatePath, 'utf-8');

    const { contact, skills } = resume;
    const expHtml = buildExperienceHtml(resume.experience);
    const eduHtml = buildEducationHtml(resume.education);
    const projHtml = buildProjectsHtml(resume.projects);

    // Contact links row
    const contactParts: string[] = [];
    if (contact.email) contactParts.push(contact.email);
    if (contact.phone) contactParts.push(contact.phone);
    if (contact.location) contactParts.push(contact.location);
    if (contact.linkedin) contactParts.push(contact.linkedin);
    if (contact.github) contactParts.push(contact.github);
    if (contact.portfolio) contactParts.push(contact.portfolio);
    const contactLine = contactParts.join(' &bull; ');

    const toChips = (arr: string[]): string =>
        arr.map(s => `<span class="chip">${s}</span>`).join('\n');

    const replacements: Record<string, string> = {
        '{{NAME}}': s(contact.name),
        '{{CONTACT_LINE}}': contactLine,
        '{{LANGUAGES}}': list(skills?.languages),
        '{{FRAMEWORKS}}': list(skills?.frameworks),
        '{{TOOLS}}': list(skills?.tools),
        '{{SOFT_SKILLS}}': list((skills as any)?.softSkills || skills?.other),
        '{{LANGUAGES_CHIPS}}': toChips(skills?.languages ?? []),
        '{{FRAMEWORKS_CHIPS}}': toChips(skills?.frameworks ?? []),
        '{{TOOLS_CHIPS}}': toChips(skills?.tools ?? []),
        '{{SOFT_CHIPS}}': toChips((skills as any)?.softSkills || skills?.other || []),
        '{{EXPERIENCE}}': expHtml,
        '{{EDUCATION}}': eduHtml,
        '{{PROJECTS}}': projHtml,
    };

    for (const [token, value] of Object.entries(replacements)) {
        html = html.replaceAll(token, value);
    }

    // Handle conditional projects block — remove wrapper tags if projects exist, strip block if empty
    if (resume.projects && resume.projects.length > 0) {
        html = html.replace(/\{\{#if_projects\}\}/g, '').replace(/\{\{\/if_projects\}\}/g, '');
    } else {
        html = html.replace(/\{\{#if_projects\}\}[\s\S]*?\{\{\/if_projects\}\}/g, '');
    }

    return html;
}
