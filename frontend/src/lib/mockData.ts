import { JDSchema, ResumeSchema, ScoreResponse, RewriteResponse, ExplainResponse } from './types';

export const MOCK_RESUME: ResumeSchema = {
    contact: {
        name: "Alex Sterling", email: "alex.sterling@example.com", phone: "+1 (555) 019-2834", location: "San Francisco, CA",
        linkedin: "linkedin.com/in/alexsterling", github: "github.com/alex-sterling", portfolio: "alexsterling.dev"
    },
    education: [
        { institution: "University of California, Berkeley", degree: "Master of Science", field: "Computer Science", graduationDate: "05/2019", gpa: "3.9" },
        { institution: "University of Michigan", degree: "Bachelor of Science", field: "Software Engineering", graduationDate: "05/2017", gpa: "3.8" }
    ],
    experience: [
        {
            company: "TechNova Solutions", role: "Senior Software Engineer", location: "San Francisco, CA", startDate: "01/2021", endDate: "Present", isCurrent: true,
            bullets: [
                "Built and maintained internal REST APIs.",
                "Improved database query times by 15%.",
                "Assisted in frontend UI development."
            ]
        },
        {
            company: "DataSync Inc.", role: "Software Engineer", location: "Remote", startDate: "06/2019", endDate: "12/2020", isCurrent: false,
            bullets: [
                "Developed microservices for data processing pipelines handling 10TB of daily payload.",
                "Collaborated with QA to increase test coverage from 65% to 92%.",
                "Mentored junior developers and performed weekly code reviews."
            ]
        },
        {
            company: "Innovate AI", role: "Software Engineering Intern", location: "Ann Arbor, MI", startDate: "05/2018", endDate: "08/2018", isCurrent: false,
            bullets: [
                "Automated deployment scripts using Bash and Python.",
                "Implemented user authentication using JWT and OAuth 2.0."
            ]
        }
    ],
    projects: [
        { title: "CloudStore Platform", description: "A highly available object storage service mimicking AWS S3 features.", technologies: ["Go", "Kubernetes", "Redis", "gRPC"], link: "github.com/alex-sterling/cloudstore" },
        { title: "React Visualizer", description: "Open-source data visualization library built with React hooks and D3.", technologies: ["React", "TypeScript", "D3.js"], link: "npmjs.com/package/react-visualizer" },
        { title: "Secure Chat", description: "End-to-end encrypted messaging application.", technologies: ["Node.js", "Socket.io", "WebRTC"], link: null }
    ],
    skills: {
        languages: ["JavaScript", "TypeScript", "Python", "Go", "Java", "SQL"],
        frameworks: ["React", "Next.js", "Express", "NestJS", "Spring Boot"],
        tools: ["Docker", "Kubernetes", "AWS (EC2, S3, RDS)", "Git", "GitHub Actions", "Redis"],
        softSkills: ["Agile Development", "System Architecture", "Cross-functional Leadership"]
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
    originalScore: 42,
    tailoredScore: 88,
    improvement: 46,
    breakdown: {
        keywordScore: 0.95,
        skillScore: 1.0,
        experienceScore: 0.89,
        densityScore: 0.75
    }
};

export const MOCK_RESUME_TEXT = `Alex Sterling
alex.sterling@example.com | +1 (555) 019-2834 | San Francisco, CA
linkedin.com/in/alexsterling | github.com/alex-sterling | alexsterling.dev

EDUCATION
University of California, Berkeley
Master of Science in Computer Science | 05/2019 | GPA: 3.9

University of Michigan
Bachelor of Science in Software Engineering | 05/2017 | GPA: 3.8

EXPERIENCE
TechNova Solutions - Senior Software Engineer
San Francisco, CA | 01/2021 – Present
- Built and maintained internal REST APIs.
- Improved database query times by 15%.
- Assisted in frontend UI development.

DataSync Inc. - Software Engineer
Remote | 06/2019 – 12/2020
- Developed microservices for data processing pipelines handling 10TB of daily payload.
- Collaborated with QA to increase test coverage from 65% to 92%.
- Mentored junior developers and performed weekly code reviews.

Innovate AI - Software Engineering Intern
Ann Arbor, MI | 05/2018 – 08/2018
- Automated deployment scripts using Bash and Python.
- Implemented user authentication using JWT and OAuth 2.0.

PROJECTS
CloudStore Platform
A highly available object storage service mimicking AWS S3 features.
Technologies: Go, Kubernetes, Redis, gRPC

React Visualizer
Open-source data visualization library built with React hooks and D3.
Technologies: React, TypeScript, D3.js

Secure Chat
End-to-end encrypted messaging application.
Technologies: Node.js, Socket.io, WebRTC

SKILLS
Languages: JavaScript, TypeScript, Python, Go, Java, SQL
Frameworks: React, Next.js, Express, NestJS, Spring Boot
Tools: Docker, Kubernetes, AWS (EC2, S3, RDS), Git, GitHub Actions, Redis
Soft Skills: Agile Development, System Architecture, Cross-functional Leadership`;

export const MOCK_JD_TEXT = `Title: Senior Full Stack Engineer
Seniority: Senior
Location: Remote

Company Overview
We are looking for a Senior Full Stack Engineer to join our core infrastructure team to build scalable microservices and lightning-fast user interfaces.

Responsibilities
- Architect scalable backend microservices.
- Design responsive user interfaces.
- Optimize highly concurrent database queries.

Requirements
- 4+ years of professional software engineering experience.
- Strong proficiency in JavaScript, TypeScript, Node.js, React, and PostgreSQL.
- Experience with AWS, Docker, and GraphQL is preferred.
- Demonstrated leadership and mentoring capabilities.
- Familiarity with principles of Scalability, Microservices, and Optimization.`;
