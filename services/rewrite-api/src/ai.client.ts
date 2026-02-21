export class AIClient {
    public async rewrite(text: string): Promise<string> {
        return 'Rewritten: ' + text;
    }
}
export const aiClient = new AIClient();
