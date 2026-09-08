import { test, expect } from '@playwright/test';

/**
 * Blog tag filtering (sprint 004 PR #8 / 004b):
 * Click a tag, see only matching posts. Empty state shown when no match.
 */

test.describe('ES blog tag filtering', () => {
    test('renders tag pill section above the post grid', async ({ page }) => {
        await page.goto('/es/blog');
        await expect(page.locator('nav.tag-filter')).toBeVisible();
        // intro-terraform has tags [Terraform, IaC, DevOps]
        await expect(page.locator('a.tag-pill[data-tag="Terraform"]')).toBeVisible();
    });

    test('clicking a tag filters to matching posts', async ({ page }) => {
        await page.goto('/es/blog');
        await page.click('a.tag-pill[data-tag="Terraform"]');
        await expect(page).toHaveURL(/tag=Terraform/);
        // Verify at least one post is shown and it has the Terraform tag
        const cards = page.locator('.post-card');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            const tagsText = await cards.nth(i).locator('.tags .tag').allTextContents();
            expect(tagsText.some((t) => t.includes('Terraform'))).toBe(true);
        }
    });

    test('All pill clears the filter', async ({ page }) => {
        await page.goto('/es/blog?tag=Terraform');
        await page.click('a.tag-pill.outline:has-text("All")');
        await expect(page).toHaveURL(/\/es\/blog$/);
    });

    test('empty state appears when no posts match the filter', async ({ page }) => {
        await page.goto('/es/blog?tag=NoSuchTagExist');
        await expect(page.locator('.empty-state')).toBeVisible();
        await expect(page.locator('.empty-state .clear-link')).toBeVisible();
    });
});
