import { Router, Request, Response } from 'express';
import { ExportRequest, TemplateId } from './schema.js';
import { renderTemplate } from './template.service.js';
import { generatePdf } from './pdf.service.js';

export const exportRouter = Router();

const VALID_TEMPLATES: TemplateId[] = ['modern', 'classic'];

exportRouter.post('/export', async (req: Request, res: Response) => {
    try {
        const body = req.body as Partial<ExportRequest>;

        // Validate request
        if (!body.tailoredResume || !body.tailoredResume.contact) {
            return res.status(400).json({
                error: 'Missing required field: tailoredResume with contact data'
            });
        }

        if (!body.template || !VALID_TEMPLATES.includes(body.template as TemplateId)) {
            return res.status(400).json({
                error: `Invalid or missing template. Valid options: ${VALID_TEMPLATES.join(', ')}`
            });
        }

        const { tailoredResume, template } = body as ExportRequest;

        // Render template → HTML, then HTML → PDF
        const html = renderTemplate(tailoredResume, template);
        const pdfBuffer = await generatePdf(html);

        const filename = `resume_${template}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.byteLength);
        res.status(200).send(pdfBuffer);
    } catch (err: any) {
        console.error('[export-api] Error generating PDF:', err);
        res.status(500).json({ error: err.message || 'PDF generation failed' });
    }
});
