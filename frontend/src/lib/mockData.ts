import { JDSchema, ResumeSchema, ScoreResponse, RewriteResponse, ExplainResponse } from './types';

export const MOCK_RESUME: ResumeSchema = {
    contact: {
        name: "Faisal Ahmed", email: "faisal@example.com", phone: "123-456-7890", location: "New York, NY",
        linkedin: "linkedin.com/in/faisal", github: "github.com/faisal", portfolio: "faisal.dev"
    },
    education: [{ institution: "Tech University", degree: "B.S.", field: "Computer Science", graduationDate: "05/2021", gpa: "3.8" }],
    experience: [
        {
            company: "Tech Corp", role: "Software Engineer", location: "Remote", startDate: "06/2021", endDate: "Present", isCurrent: true,
            bullets: [
                "Built and maintained internal REST APIs.",
                "Improved database query times by 15%.",
                "Assisted in frontend UI development."
            ]
        }
    ],
    projects: [
        { title: "Portfolio", description: "Personal website", technologies: ["Next.js", "Tailwind"], link: null }
    ],
    skills: {
        languages: ["JavaScript", "Python"],
        frameworks: ["React", "Express"],
        tools: ["Git", "Docker"],
        softSkills: ["Communication", "Agile"]
    }
};

export const MOCK_JD: JDSchema = {
    title: "Senior Full Stack Engineer",
    seniority: "Senior",
    requiredSkills: ["JavaScript", "TypeScript", "Node.js", "React", "PostgreSQL"],
    preferredSkills: ["AWS", "Docker", "GraphQL"],
    softSkills: ["Leadership", "Mentoring"],
    responsibilities: [
        "Architect scalable backend microservices.",
        "Design responsive user interfaces.",
        "Optimize highly concurrent database queries."
    ],
    keywords: ["Scalability", "Microservices", "Optimization"],
    yearsExperience: { min: 4, max: null }
};

export const MOCK_REWRITES: Record<string, RewriteResponse> = {
    "Built and maintained internal REST APIs.": {
        rewritten: "Architected and maintained scalable internal REST APIs leveraging Node.js and TypeScript microservices.",
        explanation: "Highlighted 'scalable', 'microservices', and specifically injected 'Node.js/TypeScript' to match the JD backend requirements.",
        confidence: 95
    },
    "Improved database query times by 15%.": {
        rewritten: "Optimized highly concurrent PostgreSQL database queries, improving execution times by 15%.",
        explanation: "Matched the explicit JD responsibility regarding 'concurrent queries' and integrated the 'PostgreSQL' required skill.",
        confidence: 90
    },
    "Assisted in frontend UI development.": {
        rewritten: "Designed and implemented responsive user interfaces using React.",
        explanation: "Replaced 'assisted' with full ownership 'Designed' aligning exactly with the frontend UI bullet on the JD using React.",
        confidence: 85
    }
};

export const MOCK_EXPLAINS: Record<string, ExplainResponse> = {
    "Built and maintained internal REST APIs.": { rationale: "Emphasized scalability and Node.js microservices to match core backend JD requirements." },
    "Improved database query times by 15%.": { rationale: "Directly linked your query optimization metric to PostgreSQL concurrency requirements." },
    "Assisted in frontend UI development.": { rationale: "Upgraded verb to 'Designed' framing React UI skills matching the JD." }
};

export const MOCK_SCORE: ScoreResponse = {
    beforeScore: 42,
    afterScore: 88,
    breakdown: {
        requiredCoverage: 0.40, // 2/5 (JS, React)
        preferredCoverage: 0.33, // 1/3 (Docker)
        semanticSimilarity: 0.55,
        formatPenalty: 0
    },
    afterBreakdown: {
        requiredCoverage: 1.0, // 5/5
        preferredCoverage: 0.33,
        semanticSimilarity: 0.89,
        formatPenalty: 0
    }
};
