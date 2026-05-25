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
    const url = lang === 'es' ? `http://localhost:4321/es/` : `http://localhost:4321${path}`;
    const testPath = path === '/' ? '/es/' : path;

    test(`page loads without errors: ${lang}${testPath}`, async ({ page }) => {
        const jsErrors: string[] = [];
        page.on('pageerror', (error) => {
            jsErrors.push(error.message);
        });

        await page.goto(testPath);
        await page.waitForLoadState('networkidle');

        expect(jsErrors).toHaveLength(0);
    });
}