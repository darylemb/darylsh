import { test, expect } from '@playwright/test';

/**
 * Blog tags index (sprint 004 PR #8 / 004b):
 * /[lang]/blog/tags lists all tags used in blog posts with counts.
 */

test('ES tags index shows tags and counts', async ({ page }) => {
    await page.goto('/es/blog/tags');
    await expect(page.locator('h1')).toContainText('Tags');
    await expect(page.locator('a.tag-pill').first()).toBeVisible();
    // intro-terraform has Terraform tag — must appear
    await expect(page.locator('a.tag-pill:has-text("Terraform")').first()).toBeVisible();
});

test('tags index has back link to blog', async ({ page }) => {
    await page.goto('/es/blog/tags');
    await expect(page.locator('a[href="/es/blog"]')).toBeVisible();
});

test('tags index links to filtered blog', async ({ page }) => {
    await page.goto('/en/blog/tags');
    await page.click('a.tag-pill.outline:has-text("Terraform")');
    await expect(page).toHaveURL(/en\/blog\?tag=Terraform/);
});
