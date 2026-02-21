import express from 'express';
import dotenv from 'dotenv';
import { ScoringService } from './scoring.service.js';

dotenv.config();

const app = express();
app.use(express.json());

const scoringService = new ScoringService();

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'scoring-api' });
});

app.post('/api/v1/score', async (req, res) => {
    try {
        const { resumeData, jdData } = req.body;
        if (!resumeData || !jdData) return res.status(400).json({ error: 'resumeData and jdData required' });

        const score = await scoringService.score(resumeData, jdData);
        return res.status(200).json({ score });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Scoring failed' });
    }
});

const PORT = process.env.PORT || 3004;

if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Scoring API Service listening on port ${PORT}`);
    });
}

export default app;
