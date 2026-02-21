import { Router } from 'express';
import { aiClient } from './ai.client.js';

export const analyzerRouter = Router();

analyzerRouter.post('/analyze', async (req, res) => {
    try {
        const { jdText } = req.body;
        if (!jdText) return res.status(400).json({ error: 'jdText is required' });

        const result = await aiClient.analyzeJD(jdText);
        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Analysis failed' });
    }
});
