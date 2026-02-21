import { describe, it, expect } from '@jest/globals';
import { scoreResume } from '../src/scoring.service.js';

describe('Scoring Service Maths Engine', () => {

    const baseJD = {
        title: "Software Engineer",
        seniority: "Senior",
        requiredSkills: ["React", "Node.js", "TypeScript"],
        preferredSkills: ["AWS", "Docker"],
        softSkills: [],
        responsibilities: ["Design scalable systems", "lead backend refactors"],
        keywords: ["REST", "Microservices"],
        yearsExperience: { min: 4, max: null }
    };

    const baseResume = {
        contact: { name: 'John Doe', email: 'john@example.com', phone: undefined, location: undefined, linkedin: undefined, github: undefined, portfolio: undefined },
        education: [{ institution: "University", degree: "BSCS", field: "CS", graduationDate: "05/2018", gpa: undefined }],
        experience: [
            {
                company: "Acme",
                role: "Dev",
                location: "Remote",
                startDate: "06/2018",
                endDate: "Present",
                isCurrent: true,
                bullets: ["Built UI in React and APIs wearing many hats using JS."]
            }
        ],
        projects: [],
        skills: { languages: ["JavaScript", "HTML"], frameworks: ["React"], tools: [], softSkills: ["Communication"] }
    };

    it('Identifies valid coverages mapping punctuation variations via Synonyms', () => {
        const req = {
            jd: baseJD,
            originalResume: baseResume,
            tailoredResume: baseResume // For this test equal
        };

        const score = scoreResume(req as any);

        // Required: React (1/3)
        // JD Keywords (includes preferred): AWS, Docker, REST, Microservices (0/4)
        expect(score.breakdown.skillScore).toBeLessThan(1.0);
        expect(score.breakdown.keywordScore).toBe(0);
    });

    it('Calculates the After Score Jump effectively applying rewritten bullets text dynamically', () => {
        const tailoredResume = {
            ...baseResume,
            experience: [
                {
                    ...baseResume.experience[0],
                    bullets: ["Engineered scalable backend architecture utilizing Node.js, TypeScript, and AWS Docker REST Microservices."]
                }
            ]
        };

        const req = {
            jd: baseJD,
            originalResume: baseResume,
            tailoredResume: tailoredResume
        };

        // The original gave 1/3 (33%) required and 0/2 (0%) preferred.
        // The new rewrite directly injects Node.js, TypeScript, AWS, and Docker.
        const score = scoreResume(req);

        // Improvement rule enforce
        expect(score.originalScore).toBeLessThan(score.tailoredScore);
        expect(score.improvement).toBeGreaterThan(0);

        // New Math checking out
        expect(score.breakdown.skillScore).toBe(1.0);
        expect(score.breakdown.keywordScore).toBeGreaterThan(0); // AWS, Docker, REST, Microservices
        expect(score.breakdown.experienceScore).toBeGreaterThan(0);
    });
});
