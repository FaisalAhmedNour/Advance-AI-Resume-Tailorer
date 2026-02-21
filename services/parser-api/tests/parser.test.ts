import { jest } from '@jest/globals';
import { ParserService } from '../src/parser.service.js';

describe('Parser Service', () => {
    it('parses correctly', async () => {
        const service = new ParserService();
        const result = await service.parse('mock-buffer');
        expect(result.text).toBe('Parsed Mock Resume Text...');
    });
});
