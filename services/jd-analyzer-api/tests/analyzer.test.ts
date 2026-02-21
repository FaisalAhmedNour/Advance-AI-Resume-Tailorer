import { jest } from '@jest/globals';
import { aiClient } from '../src/ai.client.js';

describe('JD Analyzer Service', () => {
    it('analyzes correctly', async () => {
        const result = await aiClient.analyzeJD('mock-jd');
        expect(result.title).toBe('Software Engineer');
    });
});
