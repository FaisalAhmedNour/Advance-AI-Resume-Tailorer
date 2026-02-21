import { Router } from 'express';
import { aiClient } from './ai.client.js';

export const rewriteRouter = Router();

rewriteRouter.post('/rewrite', async (req, res) => {
    try {
        const body = req.body;

        if (!body || !body.originalBullet) {
            return res.status(400).json({ error: 'Valid RewriteRequest payload required in body' });
        }

        if (!body.resumeContext || !Array.isArray(body.jdKeywords)) {
            return res.status(400).json({ error: 'Payload missing resumeContext or jdKeywords array' });
        }

        const { originalBullet, resumeContext, jdKeywords } = body;

        const result = await aiClient.rewriteBullet({ originalBullet, resumeContext, jdKeywords });

        return res.status(200).json(result);
    } catch (err: any) {
        console.error('Rewrite Controller Error:', err);
        return res.status(500).json({ error: err.message || 'Rewrite generation failed' });
    }
});

rewriteRouter.post('/explain', async (req, res) => {
    try {
        const body = req.body;

        if (!body || !body.originalBullet || !body.rewrittenBullet || !Array.isArray(body.jdKeywords)) {
            return res.status(400).json({ error: 'Payload requires originalBullet, rewrittenBullet, and jdKeywords array' });
        }

        const result = await aiClient.generateExplanation({
            originalBullet: body.originalBullet,
            rewrittenBullet: body.rewrittenBullet,
            jdKeywords: body.jdKeywords
        });

        return res.status(200).json(result);
    } catch (err: any) {
        console.error('Explain Controller Error:', err);
        return res.status(500).json({ error: err.message || 'Explanation generation failed' });
    }
});
