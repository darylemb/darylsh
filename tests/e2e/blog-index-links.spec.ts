import { test, expect } from '@playwright/test';

/**
 * Blog index link fix (sprint 004 PR #7):
 * "Leer más" / "Read more" must link to the post detail, not /construction.
 */

test('ES blog card links to post detail, not /construction', async ({ page }) => {
    await page.goto('/es/blog');
    const readMore = page.locator('a.read-more').first();
    await expect(readMore).toBeVisible();
    const href = await readMore.getAttribute('href');
    expect(href).toMatch(/^\/es\/blog\/intro-terraform$/);
});

test('EN blog card links to post detail, not /construction', async ({ page }) => {
    await page.goto('/en/blog');
    const readMore = page.locator('a.read-more').first();
    await expect(readMore).toBeVisible();
    const href = await readMore.getAttribute('href');
    expect(href).toMatch(/^\/en\/blog\/intro-terraform$/);
});
