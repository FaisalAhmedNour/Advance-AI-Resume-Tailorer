import { jest } from '@jest/globals';
import { aiClient } from '../src/ai.client.js';

describe('Rewrite Service', () => {
    it('rewrites correctly', async () => {
        const result = await aiClient.rewrite('mock-text');
        expect(result).toBe('Rewritten: mock-text');
    });
});
