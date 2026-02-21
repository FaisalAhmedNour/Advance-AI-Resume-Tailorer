import { Router } from 'express';
import multer from 'multer';
import { ParserService } from './parser.service.js';

export const parserRouter = Router();
const parserService = new ParserService();

// Configure multer to store files in memory as Buffers
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

parserRouter.post('/parse', upload.single('file'), async (req, res) => {
    try {
        // 1. JSON Raw Text Mode
        if (req.body && req.body.text) {
            const result = parserService.parseText(req.body.text);
            return res.status(200).json(result);
        }

        // 2. Binary File Upload Mode
        if (!req.file) {
            return res.status(400).json({ error: 'A file upload or JSON { "text": "..." } is required.' });
        }

        const { buffer, mimetype } = req.file;
        const result = await parserService.parseFile(buffer, mimetype);

        return res.status(200).json(result);

    } catch (err: any) {
        console.error('Parse Error:', err);
        return res.status(500).json({ error: err.message || 'Parse failed' });
    }
});
