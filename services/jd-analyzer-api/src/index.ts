/**
 * @file services/jd-analyzer-api/src/index.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * jd-analyzer-api — Gemini-powered JD extraction. Port 3002.
 * Reads GEMINI_API_KEY from environment (injected as GEMINI_KEY_ANALYZER
 * in docker-compose.yml → passed as GEMINI_API_KEY inside the container).
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { aiClient, ApiError } from './ai.client';

const app = express();
const PORT = Number(process.env.PORT ?? 3002);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use((_req, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res: Response) => {
    res.json({ status: 'ok', service: 'jd-analyzer-api' });
});

// ── POST /analyze ─────────────────────────────────────────────────────────────
app.post('/analyze', async (req: Request, res: Response) => {
    const { jdText } = req.body as { jdText?: unknown };

    if (typeof jdText !== 'string' || jdText.trim().length === 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: '`jdText` is required and must be a non-empty string',
        });
    }

    if (jdText.length > 20_000) {
        return res.status(413).json({
            error: 'Payload Too Large',
            message: 'Job description text must not exceed 20,000 characters',
        });
    }

    try {
        const jd = await aiClient.analyzeJD(jdText);
        return res.json({ jd });
    } catch (err) {
        if (err instanceof ApiError) {
            return res.status(err.statusCode).json({ error: err.name, message: err.message });
        }
        console.error('[jd-analyzer-api] Unexpected error:', err);
        return res.status(500).json({ error: 'Internal Server Error', message: String(err) });
    }
});

// ── Error middleware ──────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[jd-analyzer-api] Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[jd-analyzer-api] Listening on http://localhost:${PORT}`);
});

export default app;
