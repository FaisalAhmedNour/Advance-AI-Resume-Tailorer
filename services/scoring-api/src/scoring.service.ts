/**
 * @file services/scoring-api/src/scoring.service.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * Deterministic ATS-simulation scoring. No AI usage.
 *
 * Algorithm:
 *   1. Required skill coverage  (40% weight) — exact + normalised match
 *   2. Preferred skill coverage (15% weight) — exact + normalised match
 *   3. Keyword coverage         (25% weight) — substring match across full résumé text
 *   4. Jaccard semantic sim.    (20% weight) — token overlap across résumé vs JD text
 */

import { ResumeData, JDData, ScoreResponse, ScoreBreakdown } from './types';

// ── Normalisation ─────────────────────────────────────────────────────────────
function normalise(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9+#.]/g, '');
}

function resumeTextBlob(resume: ResumeData): string {
    const parts: string[] = [];
    const s = resume.skills ?? {};
    parts.push(...(s.languages ?? []), ...(s.frameworks ?? []), ...(s.tools ?? []), ...(s.other ?? []));
    for (const exp of resume.experience ?? []) {
        if (exp.role) parts.push(exp.role);
        if (exp.company) parts.push(exp.company);
        parts.push(...(exp.bullets ?? []));
    }
    for (const edu of resume.education ?? []) {
        if (edu.degree) parts.push(edu.degree);
        if (edu.field) parts.push(edu.field);
    }
    if (resume.summary) parts.push(resume.summary);
    return parts.join(' ').toLowerCase();
}

function jdTextBlob(jd: JDData): string {
    return [
        ...(jd.requiredSkills ?? []),
        ...(jd.preferredSkills ?? []),
        ...(jd.keywords ?? []),
        ...(jd.responsibilities ?? []),
    ].join(' ').toLowerCase();
}

// ── Matching helpers ──────────────────────────────────────────────────────────
function skillMatch(skill: string, blob: string): boolean {
    const norm = normalise(skill);
    return blob.includes(norm) || blob.includes(normalise(skill.toLowerCase()));
}

function computeCoverage(
    skills: string[],
    resumeBlob: string
): { matched: string[]; missing: string[]; ratio: number } {
    if (skills.length === 0) {
        return { matched: [], missing: [], ratio: 1 };
    }
    const matched: string[] = [];
    const missing: string[] = [];
    for (const skill of skills) {
        if (skillMatch(skill, resumeBlob)) {
            matched.push(skill);
        } else {
            missing.push(skill);
        }
    }
    return { matched, missing, ratio: matched.length / skills.length };
}

function jaccardSimilarity(textA: string, textB: string): number {
    const setA = new Set(textA.split(/\s+/).filter(t => t.length > 2));
    const setB = new Set(textB.split(/\s+/).filter(t => t.length > 2));
    if (setA.size === 0 && setB.size === 0) return 1;
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = [...setA].filter(t => setB.has(t)).length;
    const union = new Set([...setA, ...setB]).size;
    return intersection / union;
}

function keywordCoverage(keywords: string[], resumeBlob: string): number {
    if (keywords.length === 0) return 1;
    const hits = keywords.filter(kw => resumeBlob.includes(normalise(kw))).length;
    return hits / keywords.length;
}

// ── Main export ───────────────────────────────────────────────────────────────
export function scoreResume(resume: ResumeData, jd: JDData): ScoreResponse {
    const resumeBlob = normalise(resumeTextBlob(resume));
    const jdBlob = normalise(jdTextBlob(jd));

    const req = computeCoverage(jd.requiredSkills ?? [], resumeBlob);
    const pref = computeCoverage(jd.preferredSkills ?? [], resumeBlob);
    const kwCov = keywordCoverage(jd.keywords ?? [], resumeBlob);
    const jaccard = jaccardSimilarity(resumeBlob, jdBlob);

    const breakdown: ScoreBreakdown = {
        requiredCoverage: Math.round(req.ratio * 1000) / 1000,
        preferredCoverage: Math.round(pref.ratio * 1000) / 1000,
        keywordCoverage: Math.round(kwCov * 1000) / 1000,
        semanticSimilarity: Math.round(jaccard * 1000) / 1000,
    };

    const overallScore = Math.round(
        breakdown.requiredCoverage * 40 +
        breakdown.preferredCoverage * 15 +
        breakdown.keywordCoverage * 25 +
        breakdown.semanticSimilarity * 20
    );

    return {
        overallScore,
        beforeScore: overallScore,
        breakdown,
        matchedRequired: req.matched,
        matchedPreferred: pref.matched,
        missingRequired: req.missing,
    };
}
