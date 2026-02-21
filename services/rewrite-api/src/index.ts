import express from 'express';
import dotenv from 'dotenv';
import { rewriteRouter } from './rewrite.controller.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'rewrite-api' });
});

app.use('/api/v1/rewrite', rewriteRouter);

const PORT = process.env.PORT || 3003;

if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Rewrite API Service listening on port ${PORT}`);
    });
}

export default app;
