import { Router } from 'express';
import { scoringService } from './scoring.service.js';

export const scoringRouter = Router();

scoringRouter.post('/score', (req, res) => {
    try {
        const body = req.body;

        if (!body || !body.resume || !body.jd) {
            return res.status(400).json({ error: "Payload must contain 'resume' and 'jd' objects." });
        }

        const score = scoringService.calculateAtsScore({
            resume: body.resume,
            jd: body.jd,
            rewrittenBullets: body.rewrittenBullets || []
        });

        return res.status(200).json(score);

    } catch (err: any) {
        console.error('Scoring Controller Error:', err);
        return res.status(500).json({ error: err.message || 'Engine calculation failed' });
    }
});
