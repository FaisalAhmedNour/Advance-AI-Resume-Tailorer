import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Settings, FileText, UploadCloud, Play, FileJson, Cpu } from 'lucide-react';
import { Stepper } from '../components/Stepper';
import { MOCK_RESUME, MOCK_JD, MOCK_REWRITES, MOCK_EXPLAINS, MOCK_SCORE, MOCK_RESUME_TEXT, MOCK_JD_TEXT } from '../lib/mockData';

export default function Home() {
    const router = useRouter();
    const [isDemo, setIsDemo] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const [endpoints, setEndpoints] = useState({
        parser: 'http://localhost:3001/parse',
        analyzer: 'http://localhost:3002/analyze',
        rewrite: 'http://localhost:3003/rewrite',
        score: 'http://localhost:3004/score'
    });

    const [resumeText, setResumeText] = useState('');
    const [jdText, setJdText] = useState('');
    const [loadingStep, setLoadingStep] = useState<number | null>(null);
    const [pipelineError, setPipelineError] = useState<string | null>(null);

    const startDemo = async () => {
        setLoadingStep(0);

        // Simulate orchestration lag visually
        for (let i = 0; i <= 3; i++) {
            setLoadingStep(i);
            await new Promise(r => setTimeout(r, 800));
        }

        setLoadingStep(4);
        // Push exact mock structured payload into session storage bypassing local networks securely
        sessionStorage.setItem('tailor_session', JSON.stringify({
            resume: MOCK_RESUME,
            jd: MOCK_JD,
            rewrites: MOCK_REWRITES,
            explains: MOCK_EXPLAINS,
            score: MOCK_SCORE
        }));

        router.push('/results');
    };

    const executePipeline = async () => {
        if (isDemo) return startDemo();

        if (!resumeText.trim()) return alert('Please paste your resume text.');
        if (!jdText.trim()) return alert('Please paste the job description.');

        setPipelineError(null);

        try {
            // ── Step 0: Parse resume ────────────────────────────────────────
            setLoadingStep(0);
            const parseRes = await fetch(endpoints.parser, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: resumeText }),
            });
            if (!parseRes.ok) throw new Error(`parser-api: ${await parseRes.text()}`);
            const { resume } = await parseRes.json();

            // ── Step 1: Analyse JD ──────────────────────────────────────────
            setLoadingStep(1);
            const analyzeRes = await fetch(endpoints.analyzer, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jdText }),
            });
            if (!analyzeRes.ok) throw new Error(`jd-analyzer-api: ${await analyzeRes.text()}`);
            const { jd } = await analyzeRes.json();

            // ── Step 2: Rewrite bullets ─────────────────────────────────────
            setLoadingStep(2);
            const allBullets: string[] = (resume.experience ?? []).flatMap(
                (exp: { bullets?: string[] }) => exp.bullets ?? []
            );
            const jdKeywords: string[] = [
                ...(jd.requiredSkills ?? []),
                ...(jd.keywords ?? []),
            ]?.slice(0, 15);

            const rewrites = await Promise.all(
                allBullets.map(async (bullet: string) => {
                    const r = await fetch(endpoints.rewrite, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ originalBullet: bullet, jdKeywords }),
                    });
                    if (!r.ok) return { original: bullet, rewritten: bullet, confidence: 0 };
                    const data = await r.json();
                    return {
                        original: bullet,
                        rewritten: data.rewritten,
                        confidence: data.confidence,
                        explanation: data.explanation,
                        insertedKeywords: data.insertedKeywords,
                        improvementScore: data.improvementScore
                    };
                })
            );

            // Convert rewrites array → Record<originalBullet, RewriteResponseSchema>
            const rewriteMap: Record<string, any> = {};
            for (const r of rewrites) {
                rewriteMap[r.original] = r;
            }

            // Build tailored resume to get the "after" score
            const tailoredResume = JSON.parse(JSON.stringify(resume));
            let replacedCount = 0;
            if (tailoredResume.experience) {
                tailoredResume.experience.forEach((exp: any) => {
                    if (exp.bullets) {
                        exp.bullets = exp.bullets.map((b: string) => {
                            if (rewriteMap[b]) {
                                replacedCount++;
                                return rewriteMap[b].rewritten;
                            }
                            return b;
                        });
                    }
                });
            }
            console.log(`[Score Check] Replaced ${replacedCount} bullets in tailored resume`);
            console.log(`[Score Check] Original text blob snippet:`, JSON.stringify(resume.experience?.[0]?.bullets)?.slice(0, 100));
            console.log(`[Score Check] Tailored text blob snippet:`, JSON.stringify(tailoredResume.experience?.[0]?.bullets)?.slice(0, 100));

            // ── Step 3: Score (Before & After) ──────────────────────────────
            setLoadingStep(3);

            const scoreRes = await fetch(endpoints.score, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ originalResume: resume, tailoredResume, jd }),
            });
            if (!scoreRes.ok) throw new Error(`scoring-api: ${await scoreRes.text()}`);
            const { score: scoreData } = await scoreRes.json();

            // ── Done: store and navigate ────────────────────────────────────
            setLoadingStep(4);

            sessionStorage.setItem('tailor_session', JSON.stringify({
                resume,
                jd,
                rewrites: rewriteMap,
                explains: {},
                score: scoreData,
            }));
            router.push('/results');

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            setPipelineError(message);
            setLoadingStep(null);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-slate-50 pt-8 px-4 pb-20">

            <div className="max-w-4xl w-full">
                <div className="text-center mb-5">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-3">AI Resume Tailorer</h1>
                    <p className="text-slate-500 text-lg">Four intelligent APIs orchestrated natively.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">

                    {/* Action Bar */}
                    <div className="flex justify-between items-center mb-4 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsDemo(!isDemo)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isDemo ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <Play size={16} />
                                {/* {isDemo ? 'Demo Mode: Active' : 'Demo Mode: Off'} */}
                                Demo
                            </button>
                            <button
                                onClick={() => router.push('/interview')}
                                className="px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                            >
                                <Cpu size={16} />
                                AI Interview Preparation
                            </button>
                            {!isDemo && (
                                <span className="text-xs text-slate-400 max-w-xs leading-tight">Activating Demo bypasses local ports substituting native memory JSON mocks instantly.</span>
                            )}
                        </div>

                        <button onClick={() => setShowSettings(!showSettings)} className="text-slate-400 hover:text-accent transition-colors p-2 rounded-full hover:bg-slate-50">
                            <Settings size={22} />
                        </button>
                    </div>

                    {/* Hidden Settings Box */}
                    {showSettings && (
                        <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FileJson size={16} /> Endpoint Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(endpoints).map(([key, val]) => (
                                    <div key={key}>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{key} API</label>
                                        <input
                                            className="w-full bg-white border border-slate-300 rounded p-2 text-slate-600 outline-none focus:border-accent"
                                            value={val}
                                            onChange={e => setEndpoints({ ...endpoints, [key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Main Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><UploadCloud size={18} className="text-accent" /> Upload Resume</label>
                            <textarea
                                className={`w-full h-64 p-4 rounded-xl border ${isDemo ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-300 focus:border-accent focus:ring-4 focus:ring-accent/10'} outline-none resize-none transition-all placeholder:text-slate-300 font-mono text-xs`}
                                placeholder="Paste plain text resume here..."
                                // disabled={isDemo}
                                value={isDemo ? MOCK_RESUME_TEXT : resumeText}
                                onChange={e => setResumeText(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><FileText size={18} className="text-indigo-500" /> Target Job Description</label>
                            <textarea
                                className={`w-full h-64 p-4 rounded-xl border ${isDemo ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-white border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'} outline-none resize-none transition-all placeholder:text-slate-300 font-mono text-xs`}
                                placeholder="Paste job description..."
                                // disabled={isDemo}
                                value={isDemo ? MOCK_JD_TEXT : jdText}
                                onChange={e => setJdText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Bottom */}
                    <div className="mt-5 border-t border-slate-100 flex flex-col items-center gap-4">
                        {pipelineError && (
                            <div className="w-full max-w-2xl p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-mono break-all">
                                <span className="font-bold">Pipeline error: </span>{pipelineError}
                            </div>
                        )}
                        {loadingStep !== null ? (
                            <div className="w-full max-w-2xl animate-[fadeIn_0.5s_ease-out]">
                                <Stepper currentStep={loadingStep} />
                            </div>
                        ) : (
                            <button
                                onClick={executePipeline}
                                className="bg-prime hover:bg-black text-white px-10 py-4 rounded-full font-bold shadow-lg shadow-prime/20 transform transition-all hover:-translate-y-1"
                            >
                                {/* {isDemo ? 'Run Demo' : 'Analyze & Tailor Resume'} */}
                                Analyze & Tailor Resume
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
