import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Search, CheckCircle, RefreshCw, Cpu, BookOpen, AlertCircle } from 'lucide-react';
import { interviewData, InterviewQuestion } from '../data/interviewData';

export default function InterviewGeneratorPage() {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [results, setResults] = useState<InterviewQuestion[]>([]);
    const [hasAttempted, setHasAttempted] = useState(false);

    // Filter and Generate Logic
    const handleGenerate = () => {
        if (!keyword.trim()) return;
        setIsGenerating(true);
        setHasAttempted(true);
        setResults([]);

        // Fake AI thought process delay
        setTimeout(() => {
            const normalizedKeyword = keyword.toLowerCase().trim();

            // 1. Filter dataset
            const matched = interviewData.filter(q =>
                q.keywords.some(k => k.toLowerCase().includes(normalizedKeyword)) ||
                q.question.toLowerCase().includes(normalizedKeyword) ||
                q.answer.toLowerCase().includes(normalizedKeyword)
            );

            // 2. Shuffle array helper
            const shuffle = (array: InterviewQuestion[]) => {
                const arr = [...array];
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            };

            let finalSelection: InterviewQuestion[] = [];

            if (matched.length >= 10) {
                // If abundant matches, just pick 10 random ones from the matched set
                finalSelection = shuffle(matched).slice(0, 10);
            } else {
                // If fewer than 10 matches, take all of them
                finalSelection = [...matched];

                // Fill the rest with random behavioral questions
                const behavioral = interviewData.filter(q => q.category === 'behavioral');
                const needed = 10 - finalSelection.length;

                // Exclude any behavioral questions already in the matched set just in case
                const existingIds = new Set(finalSelection.map(q => q.id));
                const availableBehavioral = behavioral.filter(q => !existingIds.has(q.id));

                const filler = shuffle(availableBehavioral).slice(0, needed);
                finalSelection = [...finalSelection, ...filler];
            }

            // Shuffle final 10 so behavioral aren't all at the end necessarily
            setResults(shuffle(finalSelection));
            setIsGenerating(false);
        }, 500);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleGenerate();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-slate-50 pt-8 px-4 pb-20">
            <div className="max-w-4xl w-full">
                {/* Header Back Button */}
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 text-slate-500 hover:text-prime transition-colors mb-6 font-medium text-sm"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                {/* Page Title & Search Area */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 mb-8 animate-[fadeIn_0.3s_ease-out]">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-linear-to-br from-prime to-accent rounded-2xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-prime/20">
                            <Cpu size={28} className="text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-3">AI Interview Question Generator</h1>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto">
                            Powered by intelligent keyword analysis to simulate highly relevant technical interviews.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-slate-400" size={20} />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-4 rounded-xl border border-slate-300 focus:border-prime focus:ring-4 focus:ring-prime/10 outline-none text-slate-700 placeholder:text-slate-400 transition-all text-base"
                                placeholder="Enter a keyword (e.g., Node.js, Microservices, React)"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isGenerating}
                            />
                        </div>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !keyword.trim()}
                            className="bg-prime hover:bg-black text-white px-8 py-4 rounded-xl font-bold shadow-md shadow-prime/20 transform transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none md:w-auto w-full whitespace-nowrap"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw size={20} className="animate-spin" /> Analyzing...
                                </>
                            ) : (
                                'Generate'
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                {results.length > 0 && !isGenerating && (
                    <div className="animate-[slideUp_0.4s_ease-out]">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <CheckCircle size={22} className="text-emerald-500" />
                                10 Questions Generated
                            </h2>
                            <span className="text-sm font-medium text-slate-500 bg-slate-200/50 px-3 py-1 rounded-full">
                                Target: {keyword}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {results.map((q, index) => (
                                <div key={q.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 hover:border-prime/30 transition-colors group">
                                    <div className="flex gap-4 items-start">
                                        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm mt-1 group-hover:bg-prime/10 group-hover:text-prime transition-colors">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 mb-3 leading-snug">
                                                {q.question}
                                            </h3>
                                            <div className="text-slate-600 leading-relaxed text-[15px] space-y-2">
                                                <p>{q.answer}</p>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                                                    {q.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {hasAttempted && results.length === 0 && !isGenerating && (
                    <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
                        <AlertCircle size={32} className="text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-700 mb-2">No relevant questions found.</h3>
                        <p className="text-slate-500">Try broadening your keyword or searching for something else.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
