/**
 * @file services/export-api/src/pdf.service.ts
 * @generated-by Antigravity AI assistant — chunk 9 (export-api implementation)
 * @command "Create the export-api PDF generation service using Playwright"
 *
 * No AI used — deterministic Playwright headless Chromium rendering.
 * Each call launches and closes a fresh browser context (stateless).
 * Reads PLAYWRIGHT_BROWSERS_PATH env var for containerised Chromium path.
 */
import { chromium } from 'playwright';

/**
 * Renders an HTML string to a PDF buffer using a headless Playwright
 * Chromium browser. Each call launches a fresh browser context
 * (stateless, safe for concurrent requests at our expected load).
 */
export async function generatePdf(html: string): Promise<Buffer> {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle' });
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
        });
        return Buffer.from(pdfBuffer);
    } finally {
        await browser.close();
    }
}
