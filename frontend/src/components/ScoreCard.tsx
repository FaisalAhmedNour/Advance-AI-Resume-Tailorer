import React from 'react';
import { ScoreBreakdown } from '../lib/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ScoreCardProps {
    originalScore: number;
    tailoredScore: number;
    improvement: number;
    breakdown?: ScoreBreakdown;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ originalScore, tailoredScore, improvement, breakdown }) => {

    // Convert math fractions (0.43) to UI percentages (43)
    const toPercent = (num?: number) => num ? Math.round(num * 100) : 0;

    const chartData = [
        {
            name: 'Keywords',
            Score: toPercent(breakdown?.keywordScore),
        },
        {
            name: 'Skills',
            Score: toPercent(breakdown?.skillScore),
        },
        {
            name: 'Experience Bullets',
            Score: toPercent(breakdown?.experienceScore),
        },
        {
            name: 'Term Density',
            Score: toPercent(breakdown?.densityScore),
        }
    ];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden flex flex-col md:flex-row w-full transition-all">
            {/* Visual Score Orbs */}
            <div className="p-8 flex flex-col items-center justify-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 w-full md:w-1/3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">ATS Match Score</h3>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                        <div className={`text-4xl font-extrabold ${getScoreColor(originalScore)}`}>{originalScore}%</div>
                        <div className="text-xs font-semibold text-slate-500 mt-2">ORIGINAL</div>
                    </div>
                    <span className="text-slate-300 text-2xl font-light">→</span>
                    <div className="flex flex-col items-center relative">
                        <div className={`text-5xl font-black ${getScoreColor(tailoredScore)} drop-shadow-sm`}>{tailoredScore}%</div>
                        <div className="text-xs font-bold text-accent mt-2 uppercase tracking-wide">TAILORED</div>

                        {improvement > 0 && (
                            <div className="absolute -top-6 -right-8 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                <TrendingUp size={12} /> +{improvement}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Breakdown Bar Chart */}
            <div className="p-6 md:p-8 w-full md:w-2/3 h-64">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center md:text-left">Tailored Resume Metrics</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} interval={0} />
                        <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                            cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="Score" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
