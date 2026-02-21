import express from 'express';
import rateLimit from 'express-rate-limit';
import { aiClient } from './ai.client.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Global Rate Limiter: Max 20 requests per minute
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Healthcheck endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'resume-tailor' });
});

// AI Endpoint
app.post('/api/v1/tailor', async (req, res) => {
    try {
        const { systemPrompt, userText, options } = req.body;

        if (!userText) {
            return res.status(400).json({ success: false, error: 'userText is required' });
        }

        const result = await aiClient.generateContent({ systemPrompt, userText }, options);

        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    } catch (error: any) {
        console.error('Unhandled request error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

const PORT = process.env.PORT || 3001;

// Only listen if not imported (useful for testing)
if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Resume Tailor AI Service listening on port ${PORT}`);
    });
}

export default app;
