import express from 'express';
import dotenv from 'dotenv';
import { parserRouter } from './routes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'parser-api' });
});

app.use('/api/v1/parser', parserRouter);

const PORT = process.env.PORT || 3001;

if (import.meta.url === `file://${process.argv[1]}` || process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Parser API Service listening on port ${PORT}`);
    });
}

export default app;
