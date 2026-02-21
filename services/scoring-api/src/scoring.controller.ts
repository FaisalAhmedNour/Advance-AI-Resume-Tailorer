import { Router } from 'express';
import { scoreResume } from './scoring.service.js';

export const scoringRouter = Router();

scoringRouter.post('/score', (req, res) => {
    try {
        const body = req.body;

        if (!body || !body.originalResume || !body.tailoredResume || !body.jd) {
            return res.status(400).json({ error: "Payload must contain 'originalResume', 'tailoredResume', and 'jd' objects." });
        }

        const score = scoreResume({
            originalResume: body.originalResume,
            tailoredResume: body.tailoredResume,
            jd: body.jd
        });

        return res.status(200).json(score);

    } catch (err: any) {
        console.error('Scoring Controller Error:', err);
        return res.status(500).json({ error: err.message || 'Engine calculation failed' });
    }
});
