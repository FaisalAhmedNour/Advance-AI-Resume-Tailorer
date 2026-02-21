import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Download, CheckCircle, Lightbulb, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { DiffViewer } from '../components/DiffViewer';
import { ScoreCard } from '../components/ScoreCard';
import { KeywordHeatmap } from '../components/KeywordHeatmap';
import { ResumeSchema, JDSchema, RewriteResponse, ExplainResponse, ScoreResponse } from '../lib/types';

interface TailorSession {
    resume: ResumeSchema;
    jd: JDSchema;
    rewrites: Record<string, RewriteResponse>;
    explains: Record<string, ExplainResponse>;
    score: ScoreResponse;
}

export default function Results() {
    const router = useRouter();
    const [session, setSession] = useState<TailorSession | null>(null);
    const [showContext, setShowContext] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const data = sessionStorage.getItem('tailor_session');
        if (data) {
            try { setSession(JSON.parse(data)); } catch (e) { console.error('Parse err'); }
        } else {
            // Fallback if accessed raw
            router.push('/');
        }
    }, [router]);

    if (!session) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading Session...</div>;

    const exportPdf = async () => {
        setExporting(true);
        try {
            const res = await fetch('/api/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: sessionStorage.getItem('tailor_session')
            });
            if (!res.ok) throw new Error("Export failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Tailored_Resume_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (e) {
            alert('PDF Export failed. Ensure the UI export endpoint is structured.');
        }
        setTimeout(() => setExporting(false), 500);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
            {/* Nav Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-accent transition-colors font-medium text-sm">
                        <ArrowLeft size={18} /> Back to Upload
                    </button>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden md:block">Optimization Results</h1>
                    <button
                        onClick={exportPdf}
                        disabled={exporting}
                        className="flex items-center gap-2 bg-prime hover:bg-black text-white px-5 py-2 rounded font-bold text-sm shadow-md transition-all disabled:opacity-50"
                    >
                        <Download size={16} /> {exporting ? 'Rendering...' : 'Export Tailored PDF'}
                    </button>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-10">
                {/* Score Panel */}
                <div className="mb-10 animate-[fadeIn_0.5s_ease-out]">
                    <ScoreCard
                        beforeScore={session.score.beforeScore}
                        afterScore={session.score.afterScore}
                        beforeBreakdown={session.score.breakdown}
                        afterBreakdown={session.score.afterBreakdown}
                    />
                </div>

                {/* Collapsible Original Inputs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-10 overflow-hidden">
                    <button
                        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100 transition-colors"
                        onClick={() => setShowContext(!showContext)}
                    >
                        <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm"><FileText size={16} className="text-slate-400" /> Original Context (Parsed Résumé)</h3>
                        {showContext ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>
                    {showContext && (
                        <div className="p-6 text-sm text-slate-600 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <strong className="block mb-2 uppercase text-xs tracking-wider text-slate-400">Parsed Experience</strong>
                                <div className="space-y-4">
                                    {session.resume.experience.map((exp, i) => (
                                        <div key={i}>
                                            <span className="font-bold text-slate-700">{exp.role}</span> @ {exp.company} <span className="text-xs text-slate-400 block pb-1">{exp.startDate} - {exp.endDate}</span>
                                            <ul className="list-disc pl-5 space-y-1">
                                                {exp.bullets.map((b, _bi) => <li key={_bi}>{b}</li>)}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <strong className="block mb-2 uppercase text-xs tracking-wider text-slate-400">Target JD Requirements</strong>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {session.jd.requiredSkills.map(s => <span key={s} className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-semibold">{s}</span>)}
                                    {session.jd.preferredSkills.map(s => <span key={s} className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-xs">{s}</span>)}
                                </div>
                                <strong className="block mb-2 uppercase text-xs tracking-wider text-slate-400 mt-6">Responsibilities</strong>
                                <ul className="list-disc pl-5 space-y-1">
                                    {session.jd.responsibilities.map(r => <li key={r}>{r}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bullets Breakdown */}
                <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2"><CheckCircle size={22} className="text-green-500" /> Tailored Experience Bullets</h2>
                <div className="space-y-8">
                    {session.resume.experience.map((exp) => (
                        <div key={exp.company + exp.role}>
                            <h3 className="font-bold text-lg mb-4 pb-2 border-b border-slate-200 inline-block">{exp.role} <span className="text-slate-400 font-normal">at {exp.company}</span></h3>
                            <div className="space-y-6">
                                {exp.bullets.map(bullet => {
                                    const rewriteResponse = session.rewrites[bullet];
                                    const explainResponse = session.explains[bullet];

                                    if (!rewriteResponse) {
                                        // Bullet wasn't explicitly modified
                                        return (
                                            <div key={bullet} className="pl-4 border-l-4 border-slate-200">
                                                <p className="text-sm text-slate-500 italic mb-2">Unchanged</p>
                                                <KeywordHeatmap text={bullet} jdKeywords={session.jd.requiredSkills} />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={bullet} className="bg-white rounded-lg shadow-sm border border-slate-200 p-1">
                                            <DiffViewer oldText={bullet} newText={rewriteResponse.rewritten} />

                                            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 mt-1 flex flex-col md:flex-row gap-4 justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-start gap-2 max-w-2xl">
                                                        <Lightbulb size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                                            {explainResponse?.rationale || rewriteResponse.explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0 h-6">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confidence</span>
                                                    <div className={`px-2 py-0.5 rounded text-xs font-bold ${rewriteResponse.confidence >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {rewriteResponse.confidence}%
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
