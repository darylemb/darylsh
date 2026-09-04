/**
 * Theme utilities for light/dark mode toggle.
 * Persists choice in localStorage; defaults to system preference.
 *
 * Storage key: `darylsh:theme` ('light' | 'dark')
 * DOM attribute: `data-theme` on <html>
 */

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'darylsh:theme';
const THEME_ATTR = 'data-theme';
const VALID_THEMES: readonly Theme[] = ['light', 'dark'] as const;

function isValidTheme(value: unknown): value is Theme {
    return typeof value === 'string' && (VALID_THEMES as readonly string[]).includes(value);
}

/** Read the stored theme from localStorage, or null if absent/invalid. */
export function getStoredTheme(): Theme | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (isValidTheme(stored)) {
            return stored;
        }
    } catch {
        // localStorage may throw in private mode / disabled storage
    }
    return null;
}

/** Persist the chosen theme to localStorage. Does not throw. */
export function setStoredTheme(theme: Theme): void {
    try {
        localStorage.setItem(STORAGE_KEY, theme);
    } catch {
        // ignore — best effort
    }
}

/** Read the OS-level preference via prefers-color-scheme. */
export function getSystemTheme(): Theme {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Resolve the active theme: stored > system > dark. */
export function getTheme(): Theme {
    return getStoredTheme() ?? getSystemTheme();
}

/** Apply theme to DOM and persist. Dispatches `themechange` event. */
export function setTheme(theme: Theme): void {
    setStoredTheme(theme);
    document.documentElement.setAttribute(THEME_ATTR, theme);
    document.dispatchEvent(
        new CustomEvent('themechange', { detail: { theme } }),
    );
}

/** Flip the current theme and return the new value. */
export function toggleTheme(): Theme {
    const next: Theme = getTheme() === 'light' ? 'dark' : 'light';
    setTheme(next);
    return next;
}
