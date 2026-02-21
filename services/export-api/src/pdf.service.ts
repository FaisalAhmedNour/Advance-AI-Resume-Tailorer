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
