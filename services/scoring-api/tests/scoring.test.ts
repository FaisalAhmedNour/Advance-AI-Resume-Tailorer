import { scoringService } from '../src/scoring.service.js';
import { ScoreRequest } from '../src/schema.js';

describe('Scoring Service Maths Engine', () => {

    const baseJD = {
        title: "Software Engineer",
        seniority: "Senior",
        requiredSkills: ["React", "Node.js", "TypeScript"],
        preferredSkills: ["AWS", "Docker"],
        softSkills: [],
        responsibilities: ["Design scalable systems", "lead backend refactors"],
        keywords: [],
        yearsExperience: { min: 4, max: null }
    };

    const baseResume = {
        contact: { name: 'John Doe', email: 'john@example.com', phone: null, location: null, linkedin: null, github: null, portfolio: null },
        education: [{ institution: "University", degree: "BSCS", field: "CS", graduationDate: "05/2018", gpa: null }],
        experience: [
            {
                company: "Acme",
                role: "Dev",
                location: "Remote",
                startDate: "06/2018",
                endDate: "Present",
                isCurrent: true,
                bullets: ["Built UI in React.js and APIs wearing many hats using JS."]
            }
        ],
        projects: [],
        skills: { languages: ["JavaScript", "HTML"], frameworks: ["React"], tools: [], softSkills: ["Communication"] }
    };

    it('Identifies valid coverages mapping punctuation variations via Synonyms', () => {
        // resume has "React.js". JD requires "React". Should match.
        // resume has "JS" (under languages: JavaScript). JD requires "Node.js" & "TypeScript" (Missing).
        // required coverage: 1 of 3 -> 33.3%

        const req: ScoreRequest = {
            jd: baseJD,
            resume: baseResume,
            rewrittenBullets: []
        };

        const score = scoringService.calculateAtsScore(req);

        expect(score.breakdown.requiredCoverage).toBeCloseTo(0.33, 1);
        expect(score.breakdown.preferredCoverage).toBe(0); // Has neither Docker nor AWS
        expect(score.breakdown.formatPenalty).toBe(0); // dates are MM/YYYY ("05/2018", "06/2018", "Present" isn't strictly penalized if no word-dates exist)
    });

    it('Detects format penalties for arbitrarily mixing date syntaxes', () => {
        const badResume = {
            ...baseResume, experience: [
                ...baseResume.experience,
                {
                    company: "Startup", role: "Intern", location: null,
                    startDate: "Jan 2017", // Mixed format! "Jan 2017" vs "06/2018"
                    endDate: "May 2018",
                    isCurrent: false, bullets: []
                }
            ]
        }

        const score = scoringService.calculateAtsScore({
            jd: baseJD,
            resume: badResume,
            rewrittenBullets: []
        });

        expect(score.breakdown.formatPenalty).toBe(-0.05); // Hit the 5% ATS drop
    });

    it('Calculates the After Score Jump effectively applying rewritten bullets text dynamically', () => {
        const req: ScoreRequest = {
            jd: baseJD,
            resume: baseResume,
            rewrittenBullets: [
                {
                    original: "Built UI in React.js and APIs wearing many hats using JS.",
                    rewritten: "Engineered scalable backend architecture utilizing Node.js, TypeScript, and AWS Docker containers."
                }
            ]
        };

        // The original gave 1/3 (33%) required and 0/2 (0%) preferred.
        // The new rewrite directly injects Node.js, TypeScript, AWS, and Docker.
        const score = scoringService.calculateAtsScore(req);

        expect(score.beforeScore).toBeLessThan(score.afterScore);

        // New Math: 3/3 Required = 1.0. 2/2 Preferred = 1.0. 
        expect(score.afterBreakdown.requiredCoverage).toBe(1.0);
        expect(score.afterBreakdown.preferredCoverage).toBe(1.0);
        // Jaccard semantic sim should also raise since "scalable backend architecture" matches responsibilities: "scalable systems", "backend refactors".
        expect(score.afterBreakdown.semanticSimilarity).toBeGreaterThan(score.breakdown.semanticSimilarity);
    });
});
