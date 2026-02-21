import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { resume, jd, rewrites } = req.body;

        if (!resume || !jd) {
            return res.status(400).json({ error: 'Missing resume session payload.' });
        }

        // Generate clean HTML to convert to PDF
        // Apply rewrites if they exist in the dictionary, otherwise original
        let htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; font-size: 14px; }
                    h1 { font-size: 28px; margin-bottom: 5px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
                    h2 { font-size: 16px; min-width: 100%; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 5px; margin-top: 25px; margin-bottom: 15px; color: #334155; text-transform: uppercase; }
                    .contact { font-size: 12px; color: #64748b; margin-bottom: 30px; }
                    .contact span { margin-right: 15px; }
                    .job { margin-bottom: 20px; }
                    .job-header { display: flex; justify-content: space-between; font-weight: bold; color: #0f172a; margin-bottom: 4px; }
                    .job-subheader { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-bottom: 8px; font-style: italic; }
                    ul { margin: 0; padding-left: 20px; }
                    li { margin-bottom: 6px; }
                    .skills { margin-bottom: 10px; }
                    .skills strong { display: inline-block; width: 120px; color: #334155; }
                </style>
            </head>
            <body>
                <center>
                    <h1>${resume.contact?.name || 'Professional'}</h1>
                    <div class="contact">
                        ${resume.contact?.email ? `<span>${resume.contact.email}</span>` : ''}
                        ${resume.contact?.phone ? `<span>${resume.contact.phone}</span>` : ''}
                        ${resume.contact?.location ? `<span>${resume.contact.location}</span>` : ''}
                        ${resume.contact?.linkedin ? `<span>${resume.contact.linkedin}</span>` : ''}
                    </div>
                </center>

                <h2>Experience</h2>
                ${resume.experience.map((exp: any) => `
                    <div class="job">
                        <div class="job-header">
                            <span>${exp.role}</span>
                            <span>${exp.startDate || ''} - ${exp.isCurrent ? 'Present' : exp.endDate || ''}</span>
                        </div>
                        <div class="job-subheader">
                            <span>${exp.company}</span>
                            <span>${exp.location || ''}</span>
                        </div>
                        <ul>
                            ${exp.bullets.map((b: string) => `<li>${rewrites && rewrites[b] ? rewrites[b].rewritten : b}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}

                <h2>Education</h2>
                ${resume.education.map((edu: any) => `
                    <div class="job-header">
                        <span>${edu.institution}</span>
                        <span>${edu.graduationDate || ''}</span>
                    </div>
                    <div class="job-subheader" style="margin-bottom: 15px;">
                         <span>${edu.degree} in ${edu.field}</span>
                    </div>
                `).join('')}

                <h2>Technical Skills</h2>
                ${resume.skills?.languages?.length ? `<div class="skills"><strong>Languages:</strong> ${resume.skills.languages.join(', ')}</div>` : ''}
                ${resume.skills?.frameworks?.length ? `<div class="skills"><strong>Frameworks:</strong> ${resume.skills.frameworks.join(', ')}</div>` : ''}
                ${resume.skills?.tools?.length ? `<div class="skills"><strong>Tools:</strong> ${resume.skills.tools.join(', ')}</div>` : ''}
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Tailored_Resume.pdf');
        res.status(200).send(pdfBuffer);

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
}
