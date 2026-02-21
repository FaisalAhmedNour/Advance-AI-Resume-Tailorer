import { Router } from 'express';
import { ParserService } from './parser.service.js';

export const parserRouter = Router();
const parserService = new ParserService();

parserRouter.post('/parse', async (req, res) => {
    try {
        const { fileBuffer, mimeType } = req.body; // Expecting base64 buffer or similar in a real app

        if (!fileBuffer) {
            return res.status(400).json({ error: 'fileBuffer is required' });
        }

        const result = await parserService.parse(fileBuffer, mimeType);
        return res.status(200).json(result);
    } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Parse failed' });
    }
});
