import { renderTemplate } from '../src/template.service.js';
import { generatePdf } from '../src/pdf.service.js';
import { ResumeSchema } from '../src/schema.js';

const SAMPLE_RESUME: ResumeSchema = {
    contact: {
        name: 'Faisal Ahmed',
        email: 'faisal@example.com',
        phone: '555-123-4567',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/faisal',
        github: 'github.com/faisal',
        portfolio: null,
    },
    education: [
        {
            institution: 'Tech University',
            degree: 'B.S.',
            field: 'Computer Science',
            graduationDate: '05/2021',
            gpa: '3.8',
        },
    ],
    experience: [
        {
            company: 'Tech Corp',
            role: 'Senior Software Engineer',
            location: 'Remote',
            startDate: '06/2021',
            endDate: null,
            isCurrent: true,
            bullets: [
                'Architected scalable REST APIs using Node.js and TypeScript microservices.',
                'Optimized PostgreSQL queries reducing average latency by 40%.',
                'Led a team of 4 engineers delivering features on schedule.',
            ],
        },
    ],
    projects: [
        {
            title: 'AI Resume Tailorer',
            description: 'Four-microservice pipeline that tailors resumes to job descriptions.',
            technologies: ['Next.js', 'TypeScript', 'Playwright', 'Puppeteer'],
            link: 'github.com/faisal/ai-resume-tailorer',
        },
    ],
    skills: {
        languages: ['TypeScript', 'Python', 'SQL'],
        frameworks: ['Node.js', 'React', 'Express'],
        tools: ['Docker', 'PostgreSQL', 'Git'],
        softSkills: ['Leadership', 'Communication'],
    },
};

describe('Export Service', () => {

    it('renders modern template to a valid non-empty PDF', async () => {
        const html = renderTemplate(SAMPLE_RESUME, 'modern');

        // Template should have injected the name
        expect(html).toContain('Faisal Ahmed');
        expect(html).toContain('Architected scalable REST APIs');

        const pdfBuffer = await generatePdf(html);

        // Must be a Buffer
        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);

        // Must be a real PDF (check magic bytes: %PDF)
        const magicBytes = pdfBuffer.subarray(0, 4).toString('ascii');
        expect(magicBytes).toBe('%PDF');

        // Should have substantial content (not an empty/error page)
        expect(pdfBuffer.byteLength).toBeGreaterThan(5000);
    });

    it('renders classic template to a valid non-empty PDF', async () => {
        const html = renderTemplate(SAMPLE_RESUME, 'classic');

        // Classic template should have the resume data
        expect(html).toContain('Faisal Ahmed');
        expect(html).toContain('Tech Corp');

        const pdfBuffer = await generatePdf(html);

        expect(Buffer.isBuffer(pdfBuffer)).toBe(true);

        const magicBytes = pdfBuffer.subarray(0, 4).toString('ascii');
        expect(magicBytes).toBe('%PDF');

        expect(pdfBuffer.byteLength).toBeGreaterThan(5000);
    });

    it('renderTemplate handles null fields gracefully', () => {
        const minimalResume: ResumeSchema = {
            contact: {
                name: null,
                email: null,
                phone: null,
                location: null,
                linkedin: null,
                github: null,
                portfolio: null,
            },
            education: [],
            experience: [
                {
                    company: null,
                    role: null,
                    location: null,
                    startDate: null,
                    endDate: null,
                    isCurrent: false,
                    bullets: ['Did something.'],
                },
            ],
            projects: [],
            skills: { languages: [], frameworks: [], tools: [], softSkills: [] },
        };

        // Should not throw even with all-null fields
        expect(() => renderTemplate(minimalResume, 'classic')).not.toThrow();
        expect(() => renderTemplate(minimalResume, 'modern')).not.toThrow();
    });

});
