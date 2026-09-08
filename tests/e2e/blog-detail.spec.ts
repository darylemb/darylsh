import { test, expect } from '@playwright/test';

/**
 * Blog detail page (sprint 004 PR #7):
 * Markdown posts must render at /[lang]/blog/[slug] with proper layout.
 */

test.describe('ES blog detail page', () => {
    test('renders post markdown and metadata', async ({ page }) => {
        await page.goto('/es/blog/intro-terraform');
        await expect(page.locator('h1').first()).toContainText('Terraform');
        await expect(page.locator('article')).toBeVisible();
        await expect(page.locator('time').first()).toBeVisible();
    });

    test('exposes Back link to blog index', async ({ page }) => {
        await page.goto('/es/blog/intro-terraform');
        await expect(page.locator('a[href="/es/blog"]')).toBeVisible();
    });
});

test.describe('EN blog detail page', () => {
    test('renders English version', async ({ page }) => {
        await page.goto('/en/blog/intro-terraform');
        await expect(page.locator('article')).toBeVisible();
        // slug intro-terraform exists for both langs (separate frontmatter)
    });
});

test('404 for non-existent blog post slug', async ({ page }) => {
    const response = await page.goto('/es/blog/does-not-exist');
    expect(response?.status()).toBe(404);
});

test('404 for cross-language post (ES slug at /en/...)', async ({ page }) => {
    // intro-terraform exists for both langs, but verify cross-lang invalid slug is 404
    const response = await page.goto('/en/blog/this-post-only-in-es');
    expect(response?.status()).toBe(404);
});
