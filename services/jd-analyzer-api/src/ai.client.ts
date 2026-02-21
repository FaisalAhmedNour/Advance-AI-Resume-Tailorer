export class AIClient {
    public async analyzeJD(text: string): Promise<any> {
        return {
            title: "Software Engineer",
            requirements: ["TypeScript", "Node.js"],
            responsibilities: ["Build APIs"]
        };
    }
}
export const aiClient = new AIClient();
