import { JDSchema, ResumeSchema, ScoreBreakdown, ScoreRequest, ScoreResponse } from './schema.js';

const SYNONYM_MAP: Record<string, string> = {
    // A subset of standard IT mappings to ensure intersection logic holds
    javascript: 'javascript', js: 'javascript',
    typescript: 'typescript', ts: 'typescript',
    node: 'node.js', nodejs: 'node.js', 'node.js': 'node.js',
    react: 'react', reactjs: 'react', 'react.js': 'react',
    python: 'python', py: 'python',
    java: 'java',
    csharp: 'c#', 'c#': 'c#',
    cpp: 'c++', 'c++': 'c++',
    go: 'go', golang: 'go',
    aws: 'aws', amazonwebservices: 'aws',
    gcp: 'gcp', googlecloud: 'gcp',
    azure: 'azure',
    docker: 'docker',
    kubernetes: 'kubernetes', k8s: 'kubernetes',
    html: 'html', html5: 'html',
    css: 'css', css3: 'css',
    ci: 'ci/cd', cd: 'ci/cd', cicd: 'ci/cd', 'ci/cd': 'ci/cd'
};

export class ScoringService {

    /**
     * Normalizes text arrays into strictly cleaned Sets for intersection matching
     */
    private normalizeText(text: string): string {
        return (text || '').toLowerCase().replace(/[^a-z0-9+#.\-]/g, '');
    }

    private normalizeSkillsToSet(skills: string[]): Set<string> {
        const set = new Set<string>();
        for (const s of skills) {
            const clean = this.normalizeText(s);
            set.add(SYNONYM_MAP[clean] || clean); // map to base mapping if available
        }
        return set;
    }

    /**
     * Extracts ALL text recursively from Resume for broad searching
     */
    private extractAllResumeText(resume: ResumeSchema, mutatedBullets?: Map<string, string>): string {
        const chunks: string[] = [];

        // 1. Grab declared skills
        if (resume.skills) {
            chunks.push(...(resume.skills.languages || []));
            chunks.push(...(resume.skills.frameworks || []));
            chunks.push(...(resume.skills.tools || []));
            chunks.push(...(resume.skills.softSkills || []));
        }

        // 2. Grab Experience Bullets, potentially swapped for the 'After' score calculation
        if (resume.experience) {
            for (const exp of resume.experience) {
                for (const bullet of (exp.bullets || [])) {
                    if (mutatedBullets && mutatedBullets.has(bullet)) {
                        chunks.push(mutatedBullets.get(bullet)!);
                    } else {
                        chunks.push(bullet);
                    }
                }
            }
        }

        // 3. Grab Project bodies
        if (resume.projects) {
            for (const proj of resume.projects) {
                if (proj.description) chunks.push(proj.description);
                if (proj.technologies) chunks.push(...proj.technologies);
            }
        }

        return chunks.map(c => this.normalizeText(c)).join(' ');
    }

    private calculateCoverage(jdSkills: string[], resumeSuperString: string): number {
        if (!jdSkills || jdSkills.length === 0) return 1.0; // 100% since none required

        const targetSet = this.normalizeSkillsToSet(jdSkills);
        let matches = 0;

        targetSet.forEach(target => {
            // Look for the exact normalized keyword blob inside the massive resume chunk
            // Note: using regex boundaries if it's alphanumeric
            const safeTarget = target.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            const regex = new RegExp(safeTarget, 'i');
            if (regex.test(resumeSuperString)) {
                matches++;
            }
        });

        return matches / targetSet.size;
    }

    /**
     * Approximates semantic similarity via Jaccard Overlap of Tokens
     */
    private calculateJaccardSimilarity(jdResponsibilities: string[], resumeSuperString: string): number {
        if (!jdResponsibilities || jdResponsibilities.length === 0) return 0.8; // default baseline

        const jdTokens = new Set<string>();
        jdResponsibilities.forEach(resp => {
            const words = resp.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
            words.forEach(w => jdTokens.add(w));
        });

        const stops = new Set(['and', 'the', 'to', 'of', 'in', 'for', 'with', 'on', 'at', 'by', 'an', 'a']);
        stops.forEach(s => jdTokens.delete(s)); // trim stopwords artificially padding score

        if (jdTokens.size === 0) return 0.8;

        let intersection = 0;
        jdTokens.forEach(t => {
            if (resumeSuperString.includes(t)) intersection++;
        });

        return Math.min(1.0, intersection / jdTokens.size + 0.2); // +20% bump baseline for ATS approximation
    }

    /**
     * Determines if user arbitrarily switches date formats across resume blocks
     */
    private calculateFormatPenalty(resume: ResumeSchema): number {
        const dateStrings: string[] = [];
        let hasSlashes = false;
        let hasWords = false;

        const pushDate = (val: string | null) => { if (val) dateStrings.push(val); }

        (resume.education || []).forEach(e => pushDate(e.graduationDate));
        (resume.experience || []).forEach(e => { pushDate(e.startDate); pushDate(e.endDate); });

        for (const ds of dateStrings) {
            const lowerDs = ds.toLowerCase();
            if (lowerDs === 'present' || lowerDs === 'current') continue; // Standard ATS syntax

            if (/\//.test(ds)) hasSlashes = true; // MM/YYYY
            if (/[a-zA-Z]/.test(ds)) hasWords = true; // Jan 2020
        }

        // Penalty applies if both syntaxes are actively mixed randomly
        if (hasSlashes && hasWords && dateStrings.length > 2) {
            return -0.05; // -5% Match Penalty
        }
        return 0;
    }

    private computeRawScore(breakdown: ScoreBreakdown): number {
        // Weights:
        // 45% Required Skills
        // 25% Preferred Skills
        // 30% Semantic Similarity (Responsibilities Match)
        const base = (breakdown.requiredCoverage * 0.45)
            + (breakdown.preferredCoverage * 0.25)
            + (breakdown.semanticSimilarity * 0.30);

        const scoreFloat = base + breakdown.formatPenalty;
        const scoreCapped = Math.max(0, Math.min(1.0, scoreFloat));

        return Math.round(scoreCapped * 100);
    }

    public calculateAtsScore(req: ScoreRequest): ScoreResponse {
        // 1. Process "Before" Score (No rewritten bullets)
        const beforeStr = this.extractAllResumeText(req.resume);

        const beforeBreakdown: ScoreBreakdown = {
            requiredCoverage: this.calculateCoverage(req.jd.requiredSkills, beforeStr),
            preferredCoverage: this.calculateCoverage(req.jd.preferredSkills, beforeStr),
            semanticSimilarity: this.calculateJaccardSimilarity(req.jd.responsibilities, beforeStr),
            formatPenalty: this.calculateFormatPenalty(req.resume)
        };

        // 2. Process "After" Score (Swapping original text for rewritten strings)
        const mutationMap = new Map<string, string>();
        for (const rep of (req.rewrittenBullets || [])) {
            mutationMap.set(rep.original, rep.rewritten);
        }

        const afterStr = this.extractAllResumeText(req.resume, mutationMap);

        const afterBreakdown: ScoreBreakdown = {
            requiredCoverage: this.calculateCoverage(req.jd.requiredSkills, afterStr),
            preferredCoverage: this.calculateCoverage(req.jd.preferredSkills, afterStr),
            semanticSimilarity: this.calculateJaccardSimilarity(req.jd.responsibilities, afterStr),
            formatPenalty: beforeBreakdown.formatPenalty // penalty is static formatting
        };

        return {
            beforeScore: this.computeRawScore(beforeBreakdown),
            afterScore: this.computeRawScore(afterBreakdown),
            breakdown: beforeBreakdown,
            afterBreakdown: afterBreakdown
        };
    }
}

export const scoringService = new ScoringService();
