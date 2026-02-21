import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate upload and processing delays
        setTimeout(() => {
            router.push('/results');
        }, 1500);
    };

    return (
        <main style={{ padding: '40px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
            <h1>Advanced AI Resume Tailorer</h1>
            <p>Upload your resume and paste the Job Description to automatically tailor your profile to the role.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
                <div>
                    <label style={{ fontWeight: 'bold' }}>Job Description</label><br />
                    <textarea required rows={6} style={{ width: '100%', padding: '10px', marginTop: '10px' }} placeholder="Paste JD here..."></textarea>
                </div>

                <div>
                    <label style={{ fontWeight: 'bold' }}>Resume File</label><br />
                    <input required type="file" accept=".pdf,.docx,.txt" style={{ marginTop: '10px' }} />
                </div>

                <button type="submit" disabled={loading} style={{ padding: '15px', background: '#0070f3', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px', borderRadius: '4px' }}>
                    {loading ? 'Processing through AI...' : 'Analyze & Tailor'}
                </button>
            </form>
        </main>
    );
}
