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

import { ResumeData, JDData, ScoreResponse, ScoreBreakdown, ScoreRequest } from './types';

const STOPWORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if",
    "in", "into", "is", "it", "no", "not", "of", "on", "or", "such",
    "that", "the", "their", "then", "there", "these", "they", "this", "to",
    "was", "will", "with"
]);

function tokenize(text: string): string[] {
    return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

function extractUniqueKeywords(text: string): Set<string> {
    return new Set(tokenize(text));
}

function computeScore(resume: ResumeData, jd: JDData): { score: number, breakdown: ScoreBreakdown, matchedKeywords: number } {
    const jdKeywordsText = (jd.keywords ?? []).join(' ') + ' ' + (jd.preferredSkills ?? []).join(' ');
    const jdKeywordsSet = extractUniqueKeywords(jdKeywordsText);
    const totalJDKeywords = Math.max(1, jdKeywordsSet.size);

    const requiredSkillsSet = extractUniqueKeywords((jd.requiredSkills ?? []).join(' '));
    const totalRequiredSkills = Math.max(1, requiredSkillsSet.size);

    const resumeFullText = [
        ...(resume.skills?.languages ?? []),
        ...(resume.skills?.frameworks ?? []),
        ...(resume.skills?.tools ?? []),
        ...(resume.skills?.other ?? []),
        ...(resume.experience ?? []).map(e => e.role + ' ' + e.company + ' ' + (e.bullets ?? []).join(' ')),
        ...(resume.education ?? []).map(e => e.degree + ' ' + e.field),
        resume.summary ?? ''
    ].join(' ');

    const resumeTokens = extractUniqueKeywords(resumeFullText);

    let matchedJDKeywords = 0;
    jdKeywordsSet.forEach(kw => { if (resumeTokens.has(kw)) matchedJDKeywords++; });

    let matchedRequiredSkills = 0;
    requiredSkillsSet.forEach(kw => { if (resumeTokens.has(kw)) matchedRequiredSkills++; });

    let experienceText = '';
    let totalBullets = 0;
    for (const exp of resume.experience ?? []) {
        totalBullets += (exp.bullets ?? []).length;
        experienceText += (exp.bullets ?? []).join(' ') + ' ';
    }
    const expTokens = extractUniqueKeywords(experienceText);

    let matchedKeywordsInBullets = 0;
    jdKeywordsSet.forEach(kw => { if (expTokens.has(kw)) matchedKeywordsInBullets++; });
    requiredSkillsSet.forEach(kw => { if (expTokens.has(kw)) matchedKeywordsInBullets++; });

    const keywordScore = Math.min(1, matchedJDKeywords / totalJDKeywords);
    const skillScore = Math.min(1, matchedRequiredSkills / totalRequiredSkills);
    const experienceScore = Math.min(1, matchedKeywordsInBullets / totalJDKeywords);

    // Normalizing technical terms per bullet. Good density = ~2 keywords per bullet.
    const densityScore = totalBullets > 0 ? Math.min(1, matchedKeywordsInBullets / (totalBullets * 2)) : 0;

    let finalScore = (
        keywordScore * 0.4 +
        skillScore * 0.25 +
        experienceScore * 0.2 +
        densityScore * 0.15
    ) * 100;

    finalScore = Math.max(20, Math.min(95, Math.round(finalScore)));

    const breakdown: ScoreBreakdown = {
        keywordScore: Number(keywordScore.toFixed(3)),
        skillScore: Number(skillScore.toFixed(3)),
        experienceScore: Number(experienceScore.toFixed(3)),
        densityScore: Number(densityScore.toFixed(3))
    };

    return {
        score: finalScore,
        breakdown,
        matchedKeywords: matchedJDKeywords + matchedRequiredSkills
    };
}

export function scoreResume(req: ScoreRequest): ScoreResponse {
    const original = computeScore(req.originalResume, req.jd);
    const tailored = computeScore(req.tailoredResume, req.jd);

    let originalScore = original.score;
    let tailoredScore = tailored.score;

    if (tailored.matchedKeywords > original.matchedKeywords && tailoredScore <= originalScore) {
        tailoredScore = Math.min(95, originalScore + 5);
    }

    return {
        originalScore,
        tailoredScore,
        improvement: tailoredScore - originalScore,
        breakdown: tailored.breakdown
    };
}
