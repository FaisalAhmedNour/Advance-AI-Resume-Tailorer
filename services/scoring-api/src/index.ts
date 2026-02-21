/**
 * @file services/scoring-api/src/index.ts
 * @generated-by Antigravity AI assistant — chunk 15 (production rebuild)
 *
 * scoring-api — deterministic ATS scoring. Port 3004. No AI usage.
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import { scoreResume } from './scoring.service';

const app = express();
const PORT = Number(process.env.PORT ?? 3004);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use((_req, res: Response, next: NextFunction) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res: Response) => {
    res.json({ status: 'ok', service: 'scoring-api' });
});

// ── POST /score ───────────────────────────────────────────────────────────────
app.post('/score', (req: Request, res: Response) => {
    const { resumeData, jdData } = req.body as { resumeData?: unknown; jdData?: unknown };

    if (!resumeData || typeof resumeData !== 'object') {
        return res.status(400).json({
            error: 'Bad Request',
            message: '`resumeData` is required and must be an object',
        });
    }

    if (!jdData || typeof jdData !== 'object') {
        return res.status(400).json({
            error: 'Bad Request',
            message: '`jdData` is required and must be an object',
        });
    }

    const score = scoreResume(resumeData as any, jdData as any);
    return res.json({ score });
});

// ── Error middleware ──────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[scoring-api] Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[scoring-api] Listening on http://localhost:${PORT}`);
});

export default app;
