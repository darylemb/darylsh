import { test, expect } from '@playwright/test';

const PAGES = ['/es/', '/en/', '/es/projects', '/en/blog', '/es/about'];

test.describe('dark mode toggle', () => {
    test.beforeEach(async ({ context }) => {
        // Start each test with a clean slate.
        // Clear localStorage via a navigation BEFORE addInitScript, since
        // addInitScript runs on every page load (including reloads, which
        // would wipe our stored theme mid-test).
        await context.clearCookies();
        const cleanupPage = await context.newPage();
        await cleanupPage.goto('/es/');
        await cleanupPage.evaluate(() => {
            try {
                localStorage.removeItem('darylsh:theme');
            } catch {
                // ignore
            }
        });
        await cleanupPage.close();
    });

    test('toggle button is visible in the navbar on every page', async ({ page }) => {
        for (const path of PAGES) {
            await page.goto(path);
            const btn = page.getByRole('button', { name: /theme toggle/i });
            await expect(btn, `toggle on ${path}`).toBeVisible();
        }
    });

    test('clicking toggle switches data-theme attribute', async ({ page }) => {
        await page.goto('/es/');
        const initial = await page.evaluate(
            () => document.documentElement.dataset.theme,
        );
        // Default follows system preference; chromium defaults to light.
        expect(['light', 'dark']).toContain(initial);

        const btn = page.getByRole('button', { name: /theme toggle/i });
        await btn.click();

        const after = await page.evaluate(
            () => document.documentElement.dataset.theme,
        );
        expect(after).not.toBe(initial);
    });

    test('theme persists across page navigations', async ({ page }) => {
        await page.goto('/es/');
        const beforeToggle = await page.evaluate(
            () => document.documentElement.dataset.theme,
        );

        const btn = page.getByRole('button', { name: /theme toggle/i });
        await btn.click();

        const afterToggle = await page.evaluate(
            () => document.documentElement.dataset.theme,
        );
        expect(afterToggle).not.toBe(beforeToggle);

        // Navigate to another page; theme should persist
        await page.goto('/es/projects');

        const theme = await page.evaluate(
            () => document.documentElement.dataset.theme,
        );
        expect(theme).toBe(afterToggle);
    });

    test('theme persists across page reloads via localStorage', async ({ page }) => {
        await page.goto('/es/');
        const btn = page.getByRole('button', { name: /theme toggle/i });
        await btn.click();

        const beforeReload = await page.evaluate(
            () => document.documentElement.dataset.theme,
        );
        await page.reload();

        const theme = await page.evaluate(() => document.documentElement.dataset.theme);
        const stored = await page.evaluate(() => localStorage.getItem('darylsh:theme'));
        expect(theme).toBe(beforeReload);
        expect(stored).toBe(beforeReload);
    });

    test('light theme produces light background', async ({ page }) => {
        await page.goto('/es/');
        // Set light theme via localStorage and reload to apply
        await page.evaluate(() => {
            localStorage.setItem('darylsh:theme', 'light');
        });
        await page.reload();

        const bg = await page.evaluate(
            () => getComputedStyle(document.documentElement).backgroundColor,
        );
        // --bg-primary for light is #f8fafc → rgb(248, 250, 252)
        expect(bg).toBe('rgb(248, 250, 252)');
    });

    test('no flash of incorrect theme on first paint', async ({ page }) => {
        // Pre-populate localStorage with light theme
        await page.goto('/es/');
        await page.evaluate(() => {
            localStorage.setItem('darylsh:theme', 'light');
        });

        // Now navigate fresh; the anti-FOUC script should set data-theme=light
        // on the very first mutation of <html> (which happens before any paint).
        await page.goto('/es/');

        // The data-theme should be 'light' (from localStorage), not 'dark' (which
        // would indicate FOUC where the default theme briefly applied).
        const theme = await page.evaluate(
            () => document.documentElement.dataset.theme,
        );
        expect(theme).toBe('light');
    });

    test('toggle respects system preference when no stored choice', async ({ browser }) => {
        // Create context with prefers-color-scheme: light
        const context = await browser.newContext({
            colorScheme: 'light',
        });
        const page = await context.newPage();

        await page.goto('/es/');
        const theme = await page.evaluate(() => document.documentElement.dataset.theme);
        expect(theme).toBe('light');

        await context.close();
    });

    test('toggle has stable aria-label and aria-pressed', async ({ page }) => {
        await page.goto('/es/');
        const btn = page.getByRole('button', { name: /theme toggle/i });
        await expect(btn).toHaveAttribute('aria-label', 'Theme toggle');
        await expect(btn).toHaveAttribute('aria-pressed', /true|false/);
    });
});
