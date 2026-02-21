import { jest } from '@jest/globals';
import { ParserService } from '../src/parser.service.js';

describe('Parser Service - Text Logic Extraction', () => {
    let parserService: ParserService;

    beforeAll(() => {
        parserService = new ParserService();
    });

    it('Case 1: Standard structured modern tech resume', () => {
        const rawText = `
      Faisal Ahmed
      faisal@test.com
      555-010-2022
      New York, NY 10001
      
      PROFESSIONAL SUMMARY
      A passionate backend developer looking to scale operations.

      TECHNICAL SKILLS
      React Node TypeScript AWS Docker Kubernetes Express.js
      
      EXPERIENCE
      Tech Solutions Inc
      Senior Software Engineer
      2020 - Present
      - Lead migrations
      - Rewrote old services
      
      EDUCATION
      University of Test
      Bachelor of Science in Computer Science
      2015 - 2019
    `;

        const result = parserService.parseText(rawText);

        // Contact Assertions
        expect(result.contact.name).toBe('Faisal Ahmed');
        expect(result.contact.email).toBe('faisal@test.com');
        expect(result.contact.phone).toBe('555-010-2022');
        expect(result.contact.location).toBe('New York, NY 10001');

        // Section asserts
        expect(result.summary).toContain('passionate backend developer');

        // Skill mapping asserts (express.js -> express)
        expect(result.skills).toContain('React');
        expect(result.skills).toContain('Node.js');
        expect(result.skills).toContain('TypeScript');
        expect(result.skills).toContain('AWS');
        expect(result.skills).toContain('Docker');
        expect(result.skills).toContain('Kubernetes');
        expect(result.skills).toContain('Express');

        // Experience
        expect(result.experience).toHaveLength(1);
        expect(result.experience[0].company).toBe('Tech Solutions Inc');
        expect(result.experience[0].role).toBe('Senior Software Engineer');
        expect(result.experience[0].start).toBe('2020');
        expect(result.experience[0].end).toBe('Present');
        expect(result.experience[0].bullets).toHaveLength(2);

        // Education
        expect(result.education).toHaveLength(1);
        expect(result.education[0].institution).toBe('University of Test');
        expect(result.education[0].degree).toBe('Bachelor of Science in Computer Science');
        expect(result.education[0].start).toBe('2015');
        expect(result.education[0].end).toBe('2019');

        // Arrays guarantees
        expect(result.projects).toHaveLength(0);
    });

    it('Case 2: Sparse unstructured resume missing key dates and skills', () => {
        const rawText = `
      John Lackland
      john@nothing.io

      EMPLOYMENT HISTORY
      Startup X
      - Did a lot of things.
      - Developed a python script
    `;

        const result = parserService.parseText(rawText);

        expect(result.contact.email).toBe('john@nothing.io');

        // Null guarantees
        // The heuristic didn't see enough dates to parse perfectly but will fall back.
        expect(result.experience).toHaveLength(1);
        expect(result.experience[0].company).toBe('Startup X');
        expect(result.education).toHaveLength(0);
        expect(result.skills).toHaveLength(0);
        // ^ Assuming lowercase python regex match miss, let's verify if python lowercase maps

        // Wait, python lowercase is in dictionary. Let's see if the loose heuristics catch it without a SKILLS header.
        // The heuristic currently only parses `skills` block. This is a design choice in segmentText(). 
        // We expect 0 here since EMPLOYMENT HISTORY chunk consumes everything.
    });

    it('Case 3: Tricky Date Formats and Alternative Headers', () => {
        const rawText = `
      Jane Doe

      PROFILE
      A frontend architect.

      CORE COMPETENCIES
      HTML5, CSS3, Vue JS, C#, c++

      ACADEMIC BACKGROUND
      State College
      M.S. Software
      Jan 18 - Mar 2020
    `;

        const result = parserService.parseText(rawText);

        expect(result.summary).toContain('frontend architect');

        // Aliases test (vue js -> Vue.js, c++ -> C++)
        expect(result.skills).toContain('HTML');
        expect(result.skills).toContain('CSS');
        expect(result.skills).toContain('Vue.js');
        expect(result.skills).toContain('C#');
        expect(result.skills).toContain('C++');

        expect(result.education).toHaveLength(1);
        expect(result.education[0].institution).toBe('State College');
        expect(result.education[0].degree).toBe('M.S. Software');
        expect(result.education[0].start).toBe('Jan 18');
        expect(result.education[0].end).toBe('Mar 2020');
    });

});
