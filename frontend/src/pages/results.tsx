import DiffViewer from '../components/DiffViewer';
import ScoreCard from '../components/ScoreCard';

export default function Results() {
    const mockOriginal = "I am a software engineer with 2 years of experience building web apps.\nSkills: JS, React, Node.\nI like coding.";
    const mockTailored = "I am a Software Engineer experienced in building scalable APIs and full-stack web applications using TypeScript and Node.js.\nSkills: TypeScript, Node.js, React.\nProven track record of optimizing backend services.";

    return (
        <main style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h1>Tailoring Results</h1>

            <div style={{ marginBottom: '40px' }}>
                <ScoreCard score={85} />
            </div>

            <DiffViewer original={mockOriginal} tailored={mockTailored} />

            <div style={{ marginTop: '40px' }}>
                <button style={{ padding: '10px 20px', cursor: 'pointer', background: '#eee', border: '1px solid #ccc' }} onClick={() => window.history.back()}>
                    Start Over
                </button>
            </div>
        </main>
    );
}
