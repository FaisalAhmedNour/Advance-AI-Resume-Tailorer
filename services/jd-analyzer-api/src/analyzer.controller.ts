import { Router } from 'express';
import { aiClient } from './ai.client.js';

export const analyzerRouter = Router();

analyzerRouter.post('/analyze', async (req, res) => {
    try {
        const { jdText } = req.body;

        if (!jdText || typeof jdText !== 'string' || jdText.trim() === '') {
            return res.status(400).json({ error: 'Valid jdText string is required in the JSON body' });
        }

        // Pass raw string to the AI client abstraction
        const result = await aiClient.analyzeJD(jdText);

        return res.status(200).json(result);
    } catch (err: any) {
        console.error('JD Analysis Controller Error:', err);
        return res.status(500).json({ error: err.message || 'Analysis failed' });
    }
});
