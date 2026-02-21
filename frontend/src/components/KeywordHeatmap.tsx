import React from 'react';

interface KeywordHeatmapProps {
    text: string;
    jdKeywords: string[];
}

export const KeywordHeatmap: React.FC<KeywordHeatmapProps> = ({ text, jdKeywords }) => {
    if (!jdKeywords || jdKeywords.length === 0 || !text) {
        return <p className="text-slate-600 text-sm leading-relaxed">{text}</p>;
    }

    // Escape regex syntax characters from jd skills just in case (e.g., C++)
    const safeWords = jdKeywords.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const wordPattern = new RegExp(`\\b(${safeWords.join('|')})\\b`, 'gi');

    // Split text securely retaining the matched groupings by mapping
    const parts = text.split(wordPattern);

    return (
        <p className="text-slate-700 text-sm leading-relaxed">
            {parts.map((part, index) => {
                const isMatch = jdKeywords.some(kw => kw.toLowerCase() === part.toLowerCase());
                if (isMatch) {
                    return (
                        <span key={index} className="bg-yellow-200/80 font-semibold px-[2px] rounded text-prime drop-shadow-sm transition-all hover:bg-yellow-300">
                            {part}
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </p>
    );
};
