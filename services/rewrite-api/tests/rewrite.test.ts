import { jest } from '@jest/globals';
import { aiClient } from '../src/ai.client.js';

describe('Rewrite API Client Service', () => {

    it('Parses and returns rewritten bullet securely via concurrency wrapper', async () => {
        // Intercept LLM network output
        const spy = jest.spyOn(aiClient as any, 'executeGenerate').mockResolvedValue({
            rewritten: 'Developed 3 microservices using Node.js to enhance scalability.',
            explanation: 'Added strong action verb and included Node.js keyword.',
            confidence: 95
        });

        const mockReq = {
            originalBullet: 'built 3 microservices for scale.',
            resumeContext: {
                company: 'Acme Corp',
                role: 'Backend Dev',
                dates: '2020 - Present',
                otherBullets: []
            },
            jdKeywords: ['Node.js', 'Scalability']
        };

        const result = await aiClient.rewriteBullet(mockReq);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(result.rewritten).toContain('Node.js');
        expect(result.confidence).toBe(95);

        spy.mockRestore();
    });

    it('Verifies Hallucination catches when AI makes up numbers not in context', () => {
        const mockReq = {
            originalBullet: 'built microservices.',
            resumeContext: {
                company: 'Acme Corp',
                role: 'Backend Dev',
                dates: '2020 - Present',
                otherBullets: ['did 5 other things']
            },
            jdKeywords: ['Node.js', 'Scalability']
        };

        const mockRes = {
            rewritten: 'Generated 98% efficiency by building 10 microservices.',
            explanation: 'Fabricated metrics.',
            confidence: 90
        };

        // Extracting private method logic for discrete testing
        const verificationEngine = (aiClient as any).verifyNoHallucinations.bind(aiClient);

        const isVerified = verificationEngine(mockReq, mockRes);

        // Should fail verification because '98' and '10' are not in context ('2020', '5')
        expect(isVerified).toBe(false);
    });

    it('Triggers Fallback logic cleanly when Verification Engine fails', async () => {
        // LLM outputs a fabricated bullet during test
        const spy = jest.spyOn((aiClient as any).ai.models, 'generateContent').mockResolvedValue({
            text: JSON.stringify({
                rewritten: 'Boosted sales by 1000% at Acme.',
                explanation: 'Adding huge numbers looks good!',
                confidence: 100
            })
        });

        const mockReq = {
            originalBullet: 'handled sales',
            resumeContext: {
                company: 'Acme Corp',
                role: 'Sales',
                dates: '2019 - 2020',
                otherBullets: []
            },
            jdKeywords: []
        };

        const result = await aiClient.rewriteBullet(mockReq);

        // AI returned '1000', which isn't in original text. Our engine intercepts and overwrites with the fallback.
        expect(result.rewritten).toBe('Handled sales');
        expect(result.confidence).toBe(20);
        expect(result.explanation).toBe('Fallback applied due to safety constraints.');

        spy.mockRestore();
    });

});
