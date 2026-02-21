/**
 * @file services/parser-api/src/index.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * parser-api — deterministic résumé parsing, port 3001. No AI usage.
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { parseResume } from './parser.service';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use((_req, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res: Response) => {
    res.json({ status: 'ok', service: 'parser-api' });
});

// ── POST /parse ───────────────────────────────────────────────────────────────
app.post('/parse', (req: Request, res: Response) => {
    const { text } = req.body as { text?: unknown };

    if (typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: '`text` field is required and must be a non-empty string',
        });
    }

    if (text.length > 50_000) {
        return res.status(413).json({
            error: 'Payload Too Large',
            message: 'Resume text must not exceed 50,000 characters',
        });
    }

    const resume = parseResume(text);
    return res.json({ resume });
});

// ── Error middleware ──────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[parser-api] Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[parser-api] Listening on http://localhost:${PORT}`);
});

export default app;
