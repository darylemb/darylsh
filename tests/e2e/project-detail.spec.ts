import { test, expect } from '@playwright/test';

/**
 * Project detail page (sprint 004 PR #9 / 004c):
 * Migration from hardcoded array to content collection + new dynamic route.
 */

test.describe('ES project detail pages', () => {
    test('renders cloud-infrastructure-automation', async ({ page }) => {
        await page.goto('/es/projects/cloud-infrastructure-automation');
        await expect(page.locator('h1')).toContainText(
            /Cloud Infrastructure Automation/i,
        );
        await expect(page.locator('article.project')).toBeVisible();
    });

    test('renders k8s-management', async ({ page }) => {
        await page.goto('/es/projects/k8s-management');
        await expect(page.locator('h1').first()).toBeVisible();
        await expect(page.locator('a.back-link')).toBeVisible();
    });

    test('renders cicd-pipeline-design', async ({ page }) => {
        await page.goto('/es/projects/cicd-pipeline-design');
        await expect(page.locator('h1').first()).toContainText(/CI\/CD/);
    });
});

test('404 for non-existent project slug', async ({ page }) => {
    const res = await page.goto('/es/projects/this-doesnt-exist');
    expect(res?.status()).toBe(404);
});

test('ES project detail link appears on /es/projects index', async ({ page }) => {
    await page.goto('/es/projects');
    const link = page.locator('a.link').first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    // Project detail URLs come from getAllProjects (collection),
    // so any link starting with /es/projects/<slug> is valid.
    expect(href).toMatch(/^\/es\/projects\/[a-z0-9-]+$/);
});

test('Next project navigates between projects', async ({ page }) => {
    await page.goto('/es/projects/cloud-infrastructure-automation');
    const nextLink = page.locator('a.nav-next');
    await expect(nextLink).toBeVisible();
    await nextLink.click();
    await expect(page).toHaveURL(/\/es\/projects\//);
    // Make sure we navigated to a different slug
    const url = page.url();
    expect(url).not.toContain('cloud-infrastructure-automation');
});
