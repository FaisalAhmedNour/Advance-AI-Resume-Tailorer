import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import * as mammoth from 'mammoth';
import { ParseResult, Contact, Education, Experience, Project } from './types.js';

// Approx ~300 common tech skills dictionary for synonym expansion
const SKILL_DICTIONARY: Record<string, string> = {
    javascript: 'JavaScript', js: 'JavaScript',
    typescript: 'TypeScript', ts: 'TypeScript',
    node: 'Node.js', nodejs: 'Node.js',
    react: 'React', reactjs: 'React',
    python: 'Python', py: 'Python',
    java: 'Java',
    csharp: 'C#', 'c#': 'C#',
    cpp: 'C++', 'c++': 'C++',
    go: 'Go', golang: 'Go',
    ruby: 'Ruby',
    php: 'PHP',
    swift: 'Swift',
    kotlin: 'Kotlin',
    rust: 'Rust',
    sql: 'SQL', mysql: 'MySQL', postgres: 'PostgreSQL', postgresql: 'PostgreSQL',
    nosql: 'NoSQL', mongodb: 'MongoDB', mongo: 'MongoDB',
    aws: 'AWS', amazonwebservices: 'AWS',
    gcp: 'GCP', googlecloud: 'GCP',
    azure: 'Azure',
    docker: 'Docker',
    kubernetes: 'Kubernetes', k8s: 'Kubernetes',
    git: 'Git',
    linux: 'Linux',
    html: 'HTML', html5: 'HTML',
    css: 'CSS', css3: 'CSS',
    tailwind: 'Tailwind CSS', tailwindcss: 'Tailwind CSS',
    sass: 'Sass', scss: 'Sass',
    less: 'Less',
    graphql: 'GraphQL', gql: 'GraphQL',
    rest: 'REST', restapi: 'REST API',
    vue: 'Vue.js', vuejs: 'Vue.js',
    angular: 'Angular',
    svelte: 'Svelte',
    nextjs: 'Next.js', next: 'Next.js',
    nestjs: 'NestJS', nest: 'NestJS',
    express: 'Express', expressjs: 'Express',
    django: 'Django',
    flask: 'Flask',
    spring: 'Spring Boot', springboot: 'Spring Boot',
    laravel: 'Laravel',
    aspnet: 'ASP.NET',
    dotnet: '.NET',
    unity: 'Unity',
    unreal: 'Unreal Engine',
    tensorflow: 'TensorFlow', tf: 'TensorFlow',
    pytorch: 'PyTorch',
    pandas: 'Pandas',
    numpy: 'NumPy',
    scikitlearn: 'Scikit-Learn',
    ci: 'CI/CD', cd: 'CI/CD', cicd: 'CI/CD',
    jenkins: 'Jenkins',
    githubactions: 'GitHub Actions',
    gitlabci: 'GitLab CI',
    terraform: 'Terraform',
    ansible: 'Ansible',
    chef: 'Chef',
    puppet: 'Puppet',
    agile: 'Agile', scrum: 'Scrum', kanban: 'Kanban',
    jira: 'Jira',
    confluence: 'Confluence',
    redis: 'Redis',
    memcached: 'Memcached',
    elasticsearch: 'Elasticsearch',
    kafka: 'Kafka',
    rabbitmq: 'RabbitMQ',
    nginx: 'Nginx',
    apache: 'Apache',
    bash: 'Bash', shell: 'Shell Scripting',
    powershell: 'PowerShell',
    figma: 'Figma',
    sketch: 'Sketch',
    adobexd: 'Adobe XD',
    photoshop: 'Photoshop',
    illustrator: 'Illustrator',
    // Add more as needed...
};

export class ParserService {

    public async parseFile(buffer: Buffer, mimeType: string): Promise<ParseResult> {
        let text = '';

        if (mimeType === 'application/pdf') {
            const data = await pdfParse(buffer);
            text = data.text;
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else if (mimeType === 'text/plain') {
            text = buffer.toString('utf-8');
        } else {
            throw new Error(`Unsupported mime type: ${mimeType}`);
        }

        return this.parseText(text);
    }

    public parseText(rawText: string): ParseResult {
        const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\t/g, '  ');
        const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        const blocks = this.segmentText(lines);

        return {
            contact: this.extractContact(blocks.contact),
            summary: this.extractSummary(blocks.summary),
            education: this.extractEducation(blocks.education),
            experience: this.extractExperience(blocks.experience),
            skills: this.extractSkills(blocks.skills),
            projects: this.extractProjects(blocks.projects)
        };
    }

    private segmentText(lines: string[]): Record<string, string[]> {
        const blocks: Record<string, string[]> = {
            contact: [], summary: [], education: [], experience: [], skills: [], projects: []
        };

        let currentSection = 'contact'; // Assume top is contact info until first header

        for (const line of lines) {
            const upperLine = line.toUpperCase();

            // Heuristic Headers
            if (/^(SUMMARY|PROFESSIONAL SUMMARY|PROFILE|ABOUT ME)$/.test(upperLine)) {
                currentSection = 'summary';
                continue;
            } else if (/^(EDUCATION|ACADEMIC BACKGROUND)$/.test(upperLine)) {
                currentSection = 'education';
                continue;
            } else if (/^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT HISTORY)$/.test(upperLine)) {
                currentSection = 'experience';
                continue;
            } else if (/^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES)$/.test(upperLine)) {
                currentSection = 'skills';
                continue;
            } else if (/^(PROJECTS|PERSONAL PROJECTS|PORTFOLIO)$/.test(upperLine)) {
                currentSection = 'projects';
                continue;
            }

            blocks[currentSection].push(line);
        }

        return blocks;
    }

    private extractContact(lines: string[]): Contact {
        const contact: Contact = { name: null, email: null, phone: null, location: null };

        // Very naïve: first line is often the name
        if (lines.length > 0) {
            contact.name = lines[0];
        }

        const text = lines.join(' ');

        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) contact.email = emailMatch[0];

        // Phone matching (basic international and US)
        const phoneMatch = text.match(/(\+\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/);
        if (phoneMatch) contact.phone = phoneMatch[0];

        // Location (very basic city, state zip or similar pattern heuristic)
        const locMatch = text.match(/[A-Z][a-z]+(?:[ \-][A-Z][a-z]+)*,\s[A-Z]{2}(\s\d{5})?/);
        if (locMatch) contact.location = locMatch[0];

        return contact;
    }

    private extractSummary(lines: string[]): string | null {
        if (lines.length === 0) return null;
        return lines.join(' ');
    }

    private extractEducation(lines: string[]): Education[] {
        const educationList: Education[] = [];
        if (lines.length === 0) return educationList;

        // A very loose heuristic: looking for degrees and dates
        // In a real heuristic engine, we look for Universities, "BS", "Bachelor", "Master", etc.
        // For this simulation, we'll chunk by every 2 lines if we can't find dates

        let currentEdu: Education | null = null;

        for (const line of lines) {
            const isDate = /\b(19|20)\d{2}\b/.test(line) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b/i.test(line);
            const isDegree = /(Bachelor|Master|B\.S\.|M\.S\.|Ph\.D\.|Associate|Degree)/i.test(line);
            const isUniversity = /(University|College|Institute)/i.test(line);

            if (isUniversity || (isDegree && !currentEdu)) {
                if (currentEdu) educationList.push(currentEdu);
                currentEdu = { institution: line, degree: null, start: null, end: null };
            } else if (currentEdu) {
                if (isDegree && !currentEdu.degree) currentEdu.degree = line;
                else if (isDate) {
                    // naive date split
                    const dates = line.split('-').map(d => d.trim());
                    if (dates[0]) currentEdu.start = dates[0];
                    if (dates[1]) currentEdu.end = dates[1];
                    else currentEdu.end = dates[0];
                } else {
                    if (!currentEdu.degree) currentEdu.degree = line; // fallback
                }
            }
        }
        if (currentEdu) educationList.push(currentEdu);

        return educationList;
    }

    private extractExperience(lines: string[]): Experience[] {
        const expList: Experience[] = [];
        if (lines.length === 0) return expList;

        let currentExp: Experience | null = null;

        for (const line of lines) {
            // Date pattern often signals a new role or is attached to the role line
            const hasDate = /\b(19|20)\d{2}\b/.test(line);

            // Bullets usually start with -, *, •
            const isBullet = /^[-*•]/.test(line);

            if (!isBullet && hasDate) {
                if (currentExp && !currentExp.start && !currentExp.end) {
                    const dates = line.match(/\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}\b/ig);
                    if (dates && dates.length > 0) currentExp.start = dates[0];
                    if (dates && dates.length > 1) currentExp.end = dates[1];
                    else if (/\bPresent\b/i.test(line)) currentExp.end = 'Present';
                } else {
                    if (currentExp && currentExp.company) expList.push(currentExp);
                    currentExp = { company: line.replace(/\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}.*/i, '').replace(/\b(?:19|20)\d{2}.*/, '').trim(), role: null, start: null, end: null, bullets: [] };

                    const dates = line.match(/\b(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?\d{4}\b/ig);
                    if (dates && dates.length > 0) currentExp.start = dates[0];
                    if (dates && dates.length > 1) currentExp.end = dates[1];
                    else if (/\bPresent\b/i.test(line)) currentExp.end = 'Present';
                }
            } else if (isBullet && currentExp) {
                currentExp.bullets.push(line.replace(/^[-*•]\s*/, '').trim());
            } else if (!isBullet && currentExp && !currentExp.role) {
                currentExp.role = line; // Second line is often the role if not bulleted
            } else if (!isBullet && !currentExp) {
                // Fallback if date is missing on first line
                currentExp = { company: line, role: null, start: null, end: null, bullets: [] };
            }
        }

        if (currentExp && currentExp.company) expList.push(currentExp);
        return expList;
    }

    private extractSkills(lines: string[]): string[] {
        const text = lines.join(' ').toLowerCase();
        const foundSkills = new Set<string>();

        // Tokenize text word by word, and also consider pairs for things like "node js"
        const tokens = text.match(/\b\w+\b/g) || [];

        for (let i = 0; i < tokens.length; i++) {
            const word = tokens[i];
            if (SKILL_DICTIONARY[word]) foundSkills.add(SKILL_DICTIONARY[word]);

            if (i < tokens.length - 1) {
                const pair = `${tokens[i]}${tokens[i + 1]}`; // e.g. nodejs
                if (SKILL_DICTIONARY[pair]) foundSkills.add(SKILL_DICTIONARY[pair]);

                const pairSpace = `${tokens[i]} ${tokens[i + 1]}`; // e.g. node js -> doesn't match dict exactly but close
                if (SKILL_DICTIONARY[pairSpace.replace(' ', '')]) foundSkills.add(SKILL_DICTIONARY[pairSpace.replace(' ', '')]);
            }
        }

        // Also brute force specific tricky symbols like C++, C#, .NET
        if (text.includes('c++')) foundSkills.add('C++');
        if (text.includes('c#')) foundSkills.add('C#');
        if (text.includes('.net')) foundSkills.add('.NET');

        return Array.from(foundSkills);
    }

    private extractProjects(lines: string[]): Project[] {
        const projList: Project[] = [];
        if (lines.length === 0) return projList;

        let currentProj: Project | null = null;

        for (const line of lines) {
            const isBullet = /^[-*•]/.test(line);
            if (!isBullet) {
                if (currentProj) projList.push(currentProj);
                currentProj = { name: line, description: '' };
            } else if (currentProj) {
                currentProj.description += line.replace(/^[-*•]\s*/, '').trim() + ' ';
            }
        }
        if (currentProj) {
            currentProj.description = currentProj.description.trim();
            projList.push(currentProj);
        }

        return projList;
    }
}
