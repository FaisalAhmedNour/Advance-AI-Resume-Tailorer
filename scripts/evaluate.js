#!/usr/bin/env node
/**
 * scripts/evaluate.js
 *
 * Evaluation pipeline for the AI Resume Tailorer.
 * For each resume / JD pair it:
 *   1. Calls parser-api  → structured ResumeSchema JSON
 *   2. Calls jd-analyzer-api → structured JDSchema JSON
 *   3. Calls rewrite-api → rewrites every experience bullet
 *   4. Calls scoring-api → before and after ATS match scores
 *   5. Appends a row to evaluation_results.csv
 *
 * Usage:
 *   node scripts/evaluate.js
 *
 * Optionally set env vars to point at non-default service addresses:
 *   PARSER_URL, ANALYZER_URL, REWRITE_URL, SCORING_URL
 *
 * Outputs: evaluation_results.csv  (in the project root)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PARSER_URL = process.env.PARSER_URL || 'http://localhost:3001';
const ANALYZER_URL = process.env.ANALYZER_URL || 'http://localhost:3002';
const REWRITE_URL = process.env.REWRITE_URL || 'http://localhost:3003';
const SCORING_URL = process.env.SCORING_URL || 'http://localhost:3005';

const PAIRS = [
    { resume: 'resume_01.txt', jd: 'jd_01.txt', label: 'FinTech Full-Stack' },
    { resume: 'resume_02.txt', jd: 'jd_02.txt', label: 'Data Engineer' },
    { resume: 'resume_03.txt', jd: 'jd_03.txt', label: 'Staff Frontend' },
    { resume: 'resume_04.txt', jd: 'jd_04.txt', label: 'DevOps Platform' },
    { resume: 'resume_05.txt', jd: 'jd_05.txt', label: 'ML Engineer' },
];

// ── helpers ──────────────────────────────────────────────────────────────────

async function post(url, body) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`${url} → ${res.status}: ${text}`);
    }
    return res.json();
}

function readSample(subdir, filename) {
    return readFileSync(
        join(ROOT, 'tests', 'sample_data', subdir, filename),
        'utf-8'
    );
}

function csvEscape(val) {
    if (val === null || val === undefined) return '';
    const s = String(val);
    return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
}

// ── per-pair pipeline ─────────────────────────────────────────────────────────

async function runPair({ resume: resumeFile, jd: jdFile, label }) {
    console.log(`\n🔄  [${label}] Starting pipeline…`);

    // ── 1. Parse resume ──────────────────────────────────────────────────────
    const resumeText = readSample('resumes', resumeFile);
    console.log(`   → parser-api`);
    const parsed = await post(`${PARSER_URL}/api/v1/parser/parse`, {
        text: resumeText,
    });
    const resumeData = parsed.resume ?? parsed;

    // ── 2. Analyse JD ────────────────────────────────────────────────────────
    const jdText = readSample('jds', jdFile);
    console.log(`   → jd-analyzer-api`);
    const analyzed = await post(`${ANALYZER_URL}/api/v1/jd-analyzer/analyze`, {
        jdText,
    });
    const jdData = analyzed.jd ?? analyzed;

    // ── 3. Score BEFORE rewrite ─────────────────────────────────────────────
    console.log(`   → scoring-api (before)`);
    const scoreBefore = await post(`${SCORING_URL}/api/v1/score`, {
        resumeData,
        jdData,
    });
    const before = scoreBefore.score ?? scoreBefore;

    // ── 4. Rewrite bullets ───────────────────────────────────────────────────
    console.log(`   → rewrite-api`);
    const allBullets = (resumeData.experience ?? [])
        .flatMap(exp => exp.bullets ?? []);

    /** rewrittenMap: original bullet → rewritten text */
    const rewrittenMap = {};
    for (const bullet of allBullets) {
        const rw = await post(`${REWRITE_URL}/api/v1/rewrite/rewrite`, {
            bullet,
            jdKeywords: [
                ...(jdData.requiredSkills ?? []),
                ...(jdData.keywords ?? []),
            ],
            context: {
                role: resumeData.experience?.[0]?.role ?? '',
                company: resumeData.experience?.[0]?.company ?? '',
            },
        });
        rewrittenMap[bullet] = rw.rewritten ?? bullet;
    }

    // Build modified resume with rewritten bullets
    const rewrittenResume = {
        ...resumeData,
        experience: (resumeData.experience ?? []).map(exp => ({
            ...exp,
            bullets: (exp.bullets ?? []).map(b => rewrittenMap[b] ?? b),
        })),
    };

    // ── 5. Score AFTER rewrite ───────────────────────────────────────────────
    console.log(`   → scoring-api (after)`);
    const scoreAfter = await post(`${SCORING_URL}/api/v1/score`, {
        resumeData: rewrittenResume,
        jdData,
    });
    const after = scoreAfter.score ?? scoreAfter;

    const beforeScore = Math.round((before.beforeScore ?? before.overallScore ?? 0) * 100) / 100;
    const afterScore = Math.round((after.afterScore ?? after.overallScore ?? 0) * 100) / 100;
    const delta = Math.round((afterScore - beforeScore) * 100) / 100;

    const kwBefore = Math.round((before.breakdown?.requiredCoverage ?? 0) * 100) / 100;
    const kwAfter = Math.round((after.breakdown?.requiredCoverage ?? 0) * 100) / 100;

    console.log(`   ✅  Before: ${beforeScore}  After: ${afterScore}  Δ: ${delta}`);

    return {
        label,
        resumeFile,
        jdFile,
        beforeScore,
        afterScore,
        delta,
        keywordCoverageBefore: kwBefore,
        keywordCoverageAfter: kwAfter,
        bulletsRewritten: allBullets.length,
    };
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🚀  AI Resume Tailorer — Evaluation Pipeline');
    console.log(`   Parser:   ${PARSER_URL}`);
    console.log(`   Analyzer: ${ANALYZER_URL}`);
    console.log(`   Rewrite:  ${REWRITE_URL}`);
    console.log(`   Scoring:  ${SCORING_URL}`);

    const results = [];
    const errors = [];

    for (const pair of PAIRS) {
        try {
            results.push(await runPair(pair));
        } catch (err) {
            console.error(`❌  [${pair.label}] Failed: ${err.message}`);
            errors.push({ ...pair, error: err.message });
        }
    }

    // ── Write CSV ─────────────────────────────────────────────────────────────
    const CSV_PATH = join(ROOT, 'evaluation_results.csv');
    const headers = [
        'label', 'resumeFile', 'jdFile',
        'beforeScore', 'afterScore', 'delta',
        'keywordCoverageBefore', 'keywordCoverageAfter',
        'bulletsRewritten',
    ];

    const rows = results.map(r =>
        headers.map(h => csvEscape(r[h])).join(',')
    );

    writeFileSync(
        CSV_PATH,
        [headers.join(','), ...rows].join('\n') + '\n',
        'utf-8'
    );

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📊  Evaluation Summary`);
    console.log(`${'─'.repeat(60)}`);
    console.log(
        `${'Label'.padEnd(22)} ${'Before'.padStart(7)} ${'After'.padStart(7)} ${'Delta'.padStart(7)}`
    );
    console.log('─'.repeat(46));
    for (const r of results) {
        console.log(
            `${r.label.padEnd(22)} ${String(r.beforeScore).padStart(7)} ${String(r.afterScore).padStart(7)} ${String(r.delta).padStart(7)}`
        );
    }
    if (errors.length) {
        console.log(`\n⚠️   ${errors.length} pair(s) failed — check logs above.`);
    }
    console.log(`\n✅  Results written to: ${CSV_PATH}`);
    if (results.length > 0) {
        const avgDelta = (results.reduce((s, r) => s + r.delta, 0) / results.length).toFixed(2);
        console.log(`📈  Average score improvement: +${avgDelta} points`);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
