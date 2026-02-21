import React from 'react';

const ScoreCard: React.FC<{ score: number }> = ({ score }) => {
    const color = score > 80 ? 'green' : score > 60 ? 'orange' : 'red';
    return (
        <div style={{ padding: '20px', border: `2px solid ${color}`, borderRadius: '8px', width: '300px', textAlign: 'center' }}>
            <h2>ATS Match Score</h2>
            <h1 style={{ color, fontSize: '48px', margin: 0 }}>{score}%</h1>
        </div>
    );
};

export default ScoreCard;
