import { jest } from '@jest/globals';
import { aiClient } from '../src/ai.client.js';

describe('JD Analyzer AI Client Service', () => {

    beforeEach(() => {
        // Clear out cache manually via the class any bypass, or simply use different text inputs per test
    });

    it('Parses, Normalizes, and Returns matching JSON structured correctly', async () => {
        // Define a spy that intercepts the internal callGemini method to bypass Google AI API bills
        const spy = jest.spyOn(aiClient as any, 'callGemini').mockResolvedValue({
            title: "Backend Engineer",
            seniority: "senior",
            requiredSkills: ["Node.js", "TypeScript", "AWS"],
            preferredSkills: [],
            softSkills: ["Communication"],
            responsibilities: ["Build scalable APIs"],
            keywords: ["Microservices", "Docker"],
            yearsExperience: { min: 5, max: 8 }
        });

        const mockText = "Looking for a Senior Backend Engineer. 5-8 years of experience. Must know Node, TS, AWS. Better if you have soft skills like Communication and know Docker Microservices.";

        const result = await aiClient.analyzeJD(mockText);

        expect(spy).toHaveBeenCalledTimes(1);

        expect(result.title).toBe('Backend Engineer');
        expect(result.seniority).toBe('senior');

        // Check if properties from mock passed through caching mechanism and merge logic
        expect(result.requiredSkills).toContain('Node.js');
        expect(result.requiredSkills).toContain('TypeScript');
        expect(result.yearsExperience.min).toBe(5);
        expect(result.yearsExperience.max).toBe(8);

        // Run identical request to hit caching layer logic
        const cachedResult = await aiClient.analyzeJD(mockText);

        // Assert spy wasn't called a second time due to hash cache bypass
        expect(spy).toHaveBeenCalledTimes(1);
        expect(cachedResult.title).toBe('Backend Engineer');

        spy.mockRestore();
    });

    it('Correctly merges chunked text outputs favoring max experience limits and array unions', async () => {

        // Provide a mocked response list for sequential chunks
        const spy = jest.spyOn(aiClient as any, 'callGemini')
            .mockResolvedValueOnce({
                title: "Fullstack Dev",
                seniority: null,
                requiredSkills: ["React", "JavaScript"],
                preferredSkills: [],
                softSkills: [],
                responsibilities: ["UI tasks"],
                keywords: ["UI"],
                yearsExperience: { min: 2, max: 4 }
            })
            .mockResolvedValueOnce({
                title: null, // second chunk sometimes misses title
                seniority: "mid",
                requiredSkills: ["Node.js", "JavaScript"], // Duplicates JS
                preferredSkills: ["GraphQL"],
                softSkills: [],
                responsibilities: ["API tasks"],
                keywords: ["Backend"],
                yearsExperience: { min: null, max: 6 } // Expanding bounds 
            });

        // Create string large enough to trigger chunking chunkText logic ( > 5000 chars)
        const mockHeavyPayload = 'A'.repeat(5000) + ' ' + 'B'.repeat(100);

        const result = await aiClient.analyzeJD(mockHeavyPayload);

        expect(spy).toHaveBeenCalledTimes(2);

        expect(result.title).toBe('Fullstack Dev'); // Preserved from chunk 1
        expect(result.seniority).toBe('mid');     // Found in chunk 2

        // Array Union Checks
        expect(result.requiredSkills).toHaveLength(3); // React, JavaScript, Node.js
        expect(result.requiredSkills).toContain('React');
        expect(result.requiredSkills).toContain('JavaScript');
        expect(result.requiredSkills).toContain('Node.js');

        expect(result.responsibilities).toContain('UI tasks');
        expect(result.responsibilities).toContain('API tasks');

        // Experience bounds expanding
        expect(result.yearsExperience.min).toBe(2);
        expect(result.yearsExperience.max).toBe(6);

        spy.mockRestore();
    });

    it('Gracefully fails when blank text is provided', async () => {
        await expect(aiClient.analyzeJD('')).rejects.toThrow('JD text cannot be empty');
    });

});
