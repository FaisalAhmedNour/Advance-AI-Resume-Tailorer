import express from 'express';
import dotenv from 'dotenv';
import { analyzerRouter } from './analyzer.controller.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'jd-analyzer-api' });
});

app.use('/api/v1/jd-analyzer', analyzerRouter);

const PORT = process.env.PORT || 3002;

if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`JD Analyzer API Service listening on port ${PORT}`);
    });
}

export default app;
