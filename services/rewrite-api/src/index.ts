/**
 * @file services/rewrite-api/src/index.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * rewrite-api — AI bullet rewriter with anti-fabrication checks. Port 3003.
 * Reads GEMINI_API_KEY from environment (injected as GEMINI_KEY_REWRITE
 * in docker-compose.yml → passed as GEMINI_API_KEY inside the container).
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
// Try project-root .env first (3 levels up from dist/src → service → services → root)
dotenv.config({ path: resolve(__dirname, '../../../.env') });
// Also try infra/.env as secondary source
dotenv.config({ path: resolve(__dirname, '../../../../infra/.env') });
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getAiClient, ApiError } from './ai.client';

const app = express();
const PORT = Number(process.env.PORT ?? 3003);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '512kb' }));
app.use((_req, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res: Response) => {
    res.json({ status: 'ok', service: 'rewrite-api' });
});

// ── POST /rewrite ─────────────────────────────────────────────────────────────
app.post('/rewrite', async (req: Request, res: Response) => {
    const { originalBullet, jdKeywords } = req.body as {
        originalBullet?: unknown;
        jdKeywords?: unknown;
    };

    if (typeof originalBullet !== 'string' || originalBullet.trim().length === 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: '`originalBullet` is required and must be a non-empty string',
        });
    }

    if (!Array.isArray(jdKeywords)) {
        return res.status(400).json({
            error: 'Bad Request',
            message: '`jdKeywords` is required and must be an array of strings',
        });
    }

    const keywords = (jdKeywords as unknown[])
        .filter(k => typeof k === 'string')
        .map(k => (k as string).trim())
        .filter(k => k.length > 0);

    try {
        const result = await getAiClient().rewriteBullet({ originalBullet: originalBullet.trim(), jdKeywords: keywords });
        return res.json(result);
    } catch (err) {
        if (err instanceof ApiError) {
            return res.status(err.statusCode).json({ error: err.name, message: err.message });
        }
        console.error('[rewrite-api] Unexpected error:', err);
        return res.status(500).json({ error: 'Internal Server Error', message: String(err) });
    }
});

// ── Error middleware ──────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[rewrite-api] Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[rewrite-api] Listening on http://localhost:${PORT}`);
});

export default app;
