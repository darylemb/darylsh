import { test, expect } from '@playwright/test';

const CRITICAL_PAGES = [
    { lang: 'es', path: '/' },
    { lang: 'en', path: '/en/' },
    { lang: 'es', path: '/es/projects' },
    { lang: 'en', path: '/en/projects' },
    { lang: 'es', path: '/es/about' },
    { lang: 'en', path: '/en/about' },
    { lang: 'es', path: '/es/resume' },
    { lang: 'en', path: '/en/resume' },
];

for (const { lang, path } of CRITICAL_PAGES) {
    const testPath = path === '/' ? '/es/' : path;

    test(`page loads without errors: ${lang}${testPath}`, async ({ page }) => {
        const jsErrors: string[] = [];
        const consoleErrors: string[] = [];
        const failedRequests: string[] = [];

        page.on('pageerror', (error) => {
            jsErrors.push(error.message);
        });
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        page.on('requestfailed', (request) => {
            failedRequests.push(`${request.method()} ${request.url()}`);
        });
        page.on('response', (response) => {
            if (response.status() >= 400) {
                failedRequests.push(`${response.status()} ${response.url()}`);
            }
        });

        await page.goto(testPath);
        await page.waitForLoadState('networkidle');

        expect(jsErrors).toHaveLength(0);
        expect(consoleErrors).toHaveLength(0);
        expect(failedRequests).toHaveLength(0);
    });
}
