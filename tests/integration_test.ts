import fs from 'fs';
import path from 'path';

const API_BASE = {
    parser: 'http://localhost:3001/parse',
    analyzer: 'http://localhost:3002/analyze',
    rewrite: 'http://localhost:3003/rewrite',
    score: 'http://localhost:3004/score',
    export: 'http://localhost:3005/api/v1/export',
};

async function runTest() {
    console.log('--- STARTING INTEGRATION TEST ---');

    // 1. Load sample data
    const resumeText = fs.readFileSync(path.join(process.cwd(), 'tests', 'sample_data', 'resumes', 'resume_01.txt'), 'utf-8');
    const jdText = fs.readFileSync(path.join(process.cwd(), 'tests', 'sample_data', 'jds', 'jd_01.txt'), 'utf-8');

    // 2. Parse Resume
    console.log('[1/5] Parsing Resume...');
    let resumeObj;
    try {
        const r1 = await fetch(API_BASE.parser, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: resumeText }),
        });
        const d1 = await r1.json();
        resumeObj = d1.resume;
        if (!resumeObj?.contact?.name) throw new Error('Missing name in parsed resume');
        console.log(`✅ Parsed Resume for: ${resumeObj.contact.name}`);
        console.log('--- Parsed Experience Blob ---');
        console.log(JSON.stringify(resumeObj.experience, null, 2));
    } catch (e: any) {
        console.error('❌ Parse Failed:', e.message);
        return;
    }

    // 3. Analyze JD
    console.log('[2/5] Analyzing JD...');
    let jdAnalysis;
    try {
        const r2 = await fetch(API_BASE.analyzer, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jdText }),
        });
        const d2 = await r2.json();
        jdAnalysis = d2.jd;
        if (!jdAnalysis?.title) throw new Error('Missing JD title');
        console.log(`✅ Analyzed JD for: ${jdAnalysis.title} (Found ${jdAnalysis.keywords?.length || 0} keywords)`);
    } catch (e: any) {
        console.error('❌ JD Analysis Failed:', e.message);
        return;
    }

    // 4. Rewrite Bullets
    console.log('[3/5] Rewriting Bullets...');
    let allBullets: string[] = [];
    if (resumeObj.experience) {
        resumeObj.experience.forEach((e: any) => {
            if (e.bullets) allBullets.push(...e.bullets);
        });
    }
    console.log(`Found ${allBullets.length} bullets to rewrite.`);
    let rewriteMap: Record<string, string> = {};
    try {
        const keywords = [...(jdAnalysis.requiredSkills || []), ...(jdAnalysis.keywords || [])].slice(0, 15);
        for (const bullet of allBullets) {
            const r3 = await fetch(API_BASE.rewrite, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originalBullet: bullet, jdKeywords: keywords }),
            });
            const d3 = await r3.json();
            if (!d3.rewritten) throw new Error(`Missing rewritten text for bullet: ${bullet}`);
            if (bullet !== d3.rewritten) {
                console.log(`✅ Rewrote: "${bullet.substring(0, 30)}..." -> "${d3.rewritten.substring(0, 30)}..."`);
            } else {
                console.log(`⚠️ Unchanged: "${bullet.substring(0, 30)}..."`);
            }
            rewriteMap[bullet] = d3.rewritten;
        }
    } catch (e: any) {
        console.error('❌ Rewrite Failed:', e.message);
        return;
    }

    // Build tailored resume
    const tailoredResume = JSON.parse(JSON.stringify(resumeObj));
    tailoredResume.experience?.forEach((exp: any) => {
        if (exp.bullets) {
            exp.bullets = exp.bullets.map((b: string) => rewriteMap[b] || b);
        }
    });

    // 5. Score Delta
    console.log('[4/5] Scoring Resume (Before vs After)...');
    try {
        const r4a = await fetch(API_BASE.score, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeData: resumeObj, jdData: jdAnalysis }),
        });
        const beforeScoreData = await r4a.json();

        const r4b = await fetch(API_BASE.score, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeData: tailoredResume, jdData: jdAnalysis }),
        });
        const afterScoreData = await r4b.json();

        const before = beforeScoreData.score.overallScore;
        const after = afterScoreData.score.overallScore;
        const kwBefore = beforeScoreData.score.breakdown.keywordCoverage;
        const kwAfter = afterScoreData.score.breakdown.keywordCoverage;

        console.log(`Score: ${before}% -> ${after}%`);
        console.log(`Keyword Coverage: ${kwBefore}% -> ${kwAfter}%`);

        if (after > before) {
            console.log(`✅ Score successfully improved!`);
        } else {
            console.log(`⚠️ Score did not improve. (Check rewrites/keywords delta)`);
        }
    } catch (e: any) {
        console.error('❌ Scoring Failed:', e.message);
        return;
    }

    // 6. Export PDF
    console.log('[5/5] Exporting to PDF...');
    try {
        const r5 = await fetch(API_BASE.export, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tailoredResume, template: 'modern' }),
        });
        if (!r5.ok) throw new Error(await r5.text());
        const buff = await r5.arrayBuffer();
        if (buff.byteLength < 5000) throw new Error(`PDF seems too small (${buff.byteLength} bytes)`);
        console.log(`✅ PDF Generated Successfully! (${buff.byteLength} bytes)`);
    } catch (e: any) {
        console.error('❌ PDF Export Failed:', e.message);
        return;
    }

    console.log('--- INTEGRATION TEST COMPLETE ---');
}

runTest().catch(console.error);
