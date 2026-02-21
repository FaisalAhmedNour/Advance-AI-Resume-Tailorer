import { Router } from 'express';
import { aiClient } from './ai.client.js';

export const rewriteRouter = Router();

rewriteRouter.post('/rewrite', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'text is required' });

        const result = await aiClient.rewrite(text);
        return res.status(200).json({ result });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Rewrite failed' });
    }
});
