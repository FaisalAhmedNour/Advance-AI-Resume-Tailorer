import { GoogleGenAI } from '@google/genai';
import crypto from 'crypto';
import { JDSchema, JD_SYSTEM_PROMPT, Seniority } from './schema.js';

// Approx ~300 common tech skills synonym normalization map
const SYNONYM_MAP: Record<string, string> = {
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
    illustrator: 'Illustrator'
};

export class AIClient {
    private ai: GoogleGenAI;
    private cache: Map<string, JDSchema>;
    private readonly TOKEN_CHUNK_THRESHOLD = 5000; // rough char count approx for 1200 words/tokens

    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'test-key' });
        this.cache = new Map<string, JDSchema>();
    }

    private generateHash(text: string): string {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    private normalizeSkills(skills: string[]): string[] {
        if (!skills || !Array.isArray(skills)) return [];

        const normalized = new Set<string>();
        for (const skill of skills) {
            if (typeof skill !== 'string') continue;
            const clean = skill.trim().toLowerCase().replace(/\s+/g, '');
            if (SYNONYM_MAP[clean]) {
                normalized.add(SYNONYM_MAP[clean]);
            } else {
                // Fallback to original, just trimmed
                normalized.add(skill.trim());
            }
        }
        return Array.from(normalized);
    }

    private async callGemini(text: string): Promise<JDSchema> {
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    { role: 'user', parts: [{ text: text }] }
                ],
                config: {
                    systemInstruction: JD_SYSTEM_PROMPT,
                    responseMimeType: 'application/json'
                }
            });

            const rawJson = response.text;
            if (!rawJson) throw new Error("Empty AI response");

            let parsed: any;
            try {
                parsed = JSON.parse(rawJson);
            } catch (e) {
                // Attempt to extract JSON from markdown fences if the model failed strict JSON enforcement
                const match = rawJson.match(/```json\n([\s\S]*?)\n```/);
                if (match) parsed = JSON.parse(match[1]);
                else throw new Error("Failed to parse JSON schema");
            }

            // Ensure Schema Default Strict Conformity
            return {
                title: parsed.title || null,
                seniority: parsed.seniority || null,
                requiredSkills: this.normalizeSkills(parsed.requiredSkills || []),
                preferredSkills: this.normalizeSkills(parsed.preferredSkills || []),
                softSkills: Array.isArray(parsed.softSkills) ? parsed.softSkills : [],
                responsibilities: Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [],
                keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
                yearsExperience: {
                    min: typeof parsed.yearsExperience?.min === 'number' ? parsed.yearsExperience.min : null,
                    max: typeof parsed.yearsExperience?.max === 'number' ? parsed.yearsExperience.max : null
                }
            };
        } catch (err: any) {
            console.error('Gemini API Error:', err);
            throw new Error(`AI Extraction Failed: ${err.message}`);
        }
    }

    private chunkText(text: string): string[] {
        if (text.length <= this.TOKEN_CHUNK_THRESHOLD) return [text];

        // Very naive rough text chunker 
        const chunks: string[] = [];
        let currentIdx = 0;
        while (currentIdx < text.length) {
            let slice = text.substring(currentIdx, currentIdx + this.TOKEN_CHUNK_THRESHOLD);
            // Try to break on a newline to not sever words/JSON
            if (currentIdx + this.TOKEN_CHUNK_THRESHOLD < text.length) {
                const lastNewline = slice.lastIndexOf('\n');
                if (lastNewline > this.TOKEN_CHUNK_THRESHOLD * 0.8) {
                    slice = slice.substring(0, lastNewline);
                    currentIdx += lastNewline + 1;
                    chunks.push(slice);
                    continue;
                }
            }
            chunks.push(slice);
            currentIdx += this.TOKEN_CHUNK_THRESHOLD;
        }
        return chunks;
    }

    private mergeChunks(results: JDSchema[]): JDSchema {
        if (results.length === 0) return this.getEmptySchema();
        if (results.length === 1) return results[0];

        const merged = this.getEmptySchema();
        merged.title = results.find(r => r.title)?.title || null;
        merged.seniority = results.find(r => r.seniority)?.seniority || null;

        const reqSet = new Set<string>();
        const prefSet = new Set<string>();
        const softSet = new Set<string>();
        const respSet = new Set<string>();
        const keySet = new Set<string>();

        let minYears: number | null = null;
        let maxYears: number | null = null;

        for (const res of results) {
            res.requiredSkills.forEach(s => reqSet.add(s));
            res.preferredSkills.forEach(s => prefSet.add(s));
            res.softSkills.forEach(s => softSet.add(s));
            res.responsibilities.forEach(s => respSet.add(s));
            res.keywords.forEach(s => keySet.add(s));

            if (res.yearsExperience.min !== null) {
                if (minYears === null || res.yearsExperience.min < minYears) minYears = res.yearsExperience.min;
            }
            if (res.yearsExperience.max !== null) {
                if (maxYears === null || res.yearsExperience.max > maxYears) maxYears = res.yearsExperience.max;
            }
        }

        merged.requiredSkills = Array.from(reqSet);
        merged.preferredSkills = Array.from(prefSet);
        merged.softSkills = Array.from(softSet);
        merged.responsibilities = Array.from(respSet);
        merged.keywords = Array.from(keySet);
        merged.yearsExperience = { min: minYears, max: maxYears };

        return merged;
    }

    private getEmptySchema(): JDSchema {
        return {
            title: null,
            seniority: null,
            requiredSkills: [],
            preferredSkills: [],
            softSkills: [],
            responsibilities: [],
            keywords: [],
            yearsExperience: { min: null, max: null }
        };
    }

    public async analyzeJD(text: string): Promise<JDSchema> {
        if (!text || text.trim() === '') {
            throw new Error("JD text cannot be empty");
        }

        const hash = this.generateHash(text);
        if (this.cache.has(hash)) {
            console.log('Returning from cache...', hash.substring(0, 8));
            return this.cache.get(hash)!;
        }

        // Process Chunks Concurrently
        const chunks = this.chunkText(text);
        const chunkPromises = chunks.map(chunk => this.callGemini(chunk));

        const results = await Promise.all(chunkPromises);
        const finalSchema = this.mergeChunks(results);

        this.cache.set(hash, finalSchema);
        return finalSchema;
    }
}

// Export singleton
export const aiClient = new AIClient();
