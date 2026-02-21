import { jest } from '@jest/globals';
import { aiClient } from '../src/ai.client.js';

describe('AIClient', () => {

    beforeEach(() => {
        // Suppress console logs during tests to keep output clean
        jest.spyOn(console, 'info').mockImplementation(() => { });
        jest.spyOn(console, 'warn').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('declines completely empty text instantly', async () => {
        const res = await aiClient.generateContent({ userText: '   ' });
        expect(res.success).toBe(false);
        expect(res.error).toMatch(/empty/);
    });

    it('retries transient errors and succeeds eventually', async () => {
        // Spy on the internal API call logic implicitly
        let callCount = 0;
        const callApiSpy = jest.spyOn(aiClient as any, '_callExternalAPI').mockImplementation(async () => {
            callCount++;
            if (callCount < 2) {
                throw Object.assign(new Error('Simulated transient error'), { status: 503 });
            }
            return 'Success Result';
        });

        const res = await aiClient.generateContent({ userText: 'Valid user text' });
        expect(callCount).toBe(2);
        expect(res.success).toBe(true);
        expect(res.data).toBe('Success Result');
        expect(res.retries).toBe(1);

        callApiSpy.mockRestore();
    });

    it('fails cleanly on non-transient error', async () => {
        const callApiSpy = jest.spyOn(aiClient as any, '_callExternalAPI').mockImplementation(async () => {
            throw Object.assign(new Error('Not found'), { status: 404 });
        });

        const res = await aiClient.generateContent({ userText: 'Valid user text' });
        expect(res.success).toBe(false);
        expect(res.error).toBe('Not found');

        callApiSpy.mockRestore();
    });

    it('respects requested JSON format', async () => {
        const callApiSpy = jest.spyOn(aiClient as any, '_callExternalAPI').mockImplementation(async () => {
            return { tailoredResume: 'test json' };
        });

        const res = await aiClient.generateContent(
            { userText: 'Make this a resume' },
            { responseFormat: 'json' }
        );
        expect(res.success).toBe(true);
        expect(res.data).toHaveProperty('tailoredResume', 'test json');

        callApiSpy.mockRestore();
    });
});
