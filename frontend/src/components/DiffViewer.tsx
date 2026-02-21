import React from 'react';

const DiffViewer: React.FC<{ original: string; tailored: string }> = ({ original, tailored }) => {
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '20px' }}>
            <div style={{ flex: 1, border: '1px solid #ccc', padding: '10px' }}>
                <h3>Original Resume</h3>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{original}</pre>
            </div>
            <div style={{ flex: 1, border: '1px solid #4CAF50', padding: '10px' }}>
                <h3>Tailored Resume</h3>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{tailored}</pre>
            </div>
        </div>
    );
};

export default DiffViewer;
