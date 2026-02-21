import { jest } from '@jest/globals';
import { ScoringService } from '../src/scoring.service.js';

describe('Scoring Service', () => {
    it('calculates score correctly', async () => {
        const service = new ScoringService();
        const result = await service.score({}, {});
        expect(result).toBe(85);
    });
});
