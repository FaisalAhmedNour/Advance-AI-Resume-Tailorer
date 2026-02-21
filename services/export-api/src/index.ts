import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { exportRouter } from './export.controller.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/health', (_req, res) => {
    res.json({ service: 'export-api', status: 'ok', port: PORT });
});

app.use('/api/v1', exportRouter);

app.listen(PORT, () => {
    console.log(`[export-api] Listening on http://localhost:${PORT}`);
    console.log(`[export-api] POST http://localhost:${PORT}/api/v1/export`);
});

export default app;
