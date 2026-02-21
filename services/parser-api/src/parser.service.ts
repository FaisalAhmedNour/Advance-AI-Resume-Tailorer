import { ParseResult } from './types.js';

export class ParserService {
    async parse(buffer: string, mimeType?: string): Promise<ParseResult> {
        // Mock parsing
        return {
            text: "Parsed Mock Resume Text..."
        };
    }
}
