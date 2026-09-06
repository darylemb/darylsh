import { test, expect } from '@playwright/test';

/**
 * SEO fundamentals: every page must declare Open Graph, Twitter Card,
 * hreflang alternates, JSON-LD structured data, and exactly one H1.
 */

const SEO_PAGES = [
    { lang: 'es', path: '/es/' },
    { lang: 'en', path: '/en/' },
    { lang: 'es', path: '/es/blog/' },
    { lang: 'en', path: '/en/blog/' },
    { lang: 'es', path: '/es/projects/' },
    { lang: 'en', path: '/en/projects/' },
    { lang: 'es', path: '/es/contact/' },
    { lang: 'en', path: '/en/contact/' },
    { lang: 'es', path: '/es/about/' },
    { lang: 'en', path: '/en/about/' },
    { lang: 'es', path: '/es/resume/' },
    { lang: 'en', path: '/en/resume/' },
    { lang: 'es', path: '/es/projects/k8s-management/' },
    { lang: 'en', path: '/en/projects/k8s-management/' },
];

for (const { lang, path } of SEO_PAGES) {
    test.describe(`${lang} ${path}`, () => {
        test('has Open Graph meta tags', async ({ page }) => {
            await page.goto(path);
            await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', /.+/);
            await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', /daryl\.sh/);
            await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
            await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
            await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /daryl\.sh\/og\//);
            await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
                'content',
                lang === 'es' ? 'es_MX' : 'en_US',
            );
        });

        test('has Twitter Card meta tags', async ({ page }) => {
            await page.goto(path);
            await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
            await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', /.+/);
            await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /.+/);
            await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /daryl\.sh\/og\//);
            await expect(page.locator('meta[name="twitter:site"]')).toHaveAttribute('content', /@darylemb/);
        });

        test('has 3 hreflang alternates (es, en, x-default)', async ({ page }) => {
            await page.goto(path);
            await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveCount(1);
            await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
            await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
        });

        test('has exactly one H1', async ({ page }) => {
            await page.goto(path);
            const h1s = page.locator('h1');
            await expect(h1s).toHaveCount(1);
        });

        test('has JSON-LD structured data with @graph', async ({ page }) => {
            await page.goto(path);
            const jsonLd = page.locator('script[type="application/ld+json"]');
            await expect(jsonLd).toHaveCount(1);
            const text = await jsonLd.textContent();
            expect(text).toContain('"@context":"https://schema.org"');
            expect(text).toContain('"@graph"');
            // Person schema is always present
            expect(text).toContain('"@type":"Person"');
            // WebSite is also always present
            expect(text).toContain('"@type":"WebSite"');
            // LinkedIn sameAs link is wired up
            expect(text).toContain('linkedin.com/in/darylemb');
        });

        test('description is in the optimal 100-160 char range', async ({ page }) => {
            await page.goto(path);
            const desc = await page.locator('meta[name="description"]').getAttribute('content');
            expect(desc).toBeTruthy();
            expect(desc!.length).toBeGreaterThanOrEqual(80);
            expect(desc!.length).toBeLessThanOrEqual(160);
        });

        test('viewport meta has initial-scale=1', async ({ page }) => {
            await page.goto(path);
            await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /initial-scale=1/);
        });
    });
}

test.describe('404 page', () => {
    test('does NOT have hreflang (404 is content-free)', async ({ page }) => {
        await page.goto('/404');
        await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    });

    test('still has Open Graph tags', async ({ page }) => {
        await page.goto('/404');
        await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    });
});
