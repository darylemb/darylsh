import { describe, it, expect, beforeEach, vi } from 'vitest';
// @vitest-environment jsdom
import {
    type Theme,
    getStoredTheme,
    setStoredTheme,
    getSystemTheme,
    getTheme,
    setTheme,
    toggleTheme,
} from '../../src/lib/theme';

describe('theme utilities', () => {
    beforeEach(() => {
        // Reset localStorage and DOM
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        vi.restoreAllMocks();
        // Provide a default matchMedia mock so getSystemTheme() has something
        // to call. Individual tests override this with vi.spyOn().
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: vi.fn().mockImplementation(
                (query: string) =>
                    ({
                        matches: false,
                        media: query,
                        onchange: null,
                        addListener: vi.fn(),
                        removeListener: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as MediaQueryList
            ),
        });
    });

    describe('getStoredTheme', () => {
        it('returns null when nothing is stored', () => {
            expect(getStoredTheme()).toBeNull();
        });

        it('returns "light" when light is stored', () => {
            localStorage.setItem('darylsh:theme', 'light');
            expect(getStoredTheme()).toBe('light');
        });

        it('returns "dark" when dark is stored', () => {
            localStorage.setItem('darylsh:theme', 'dark');
            expect(getStoredTheme()).toBe('dark');
        });

        it('returns null for invalid stored values', () => {
            localStorage.setItem('darylsh:theme', 'invalid');
            expect(getStoredTheme()).toBeNull();
        });

        it('returns null when localStorage throws', () => {
            const originalGetItem = Storage.prototype.getItem;
            Storage.prototype.getItem = vi.fn(() => {
                throw new Error('localStorage disabled');
            });
            try {
                expect(getStoredTheme()).toBeNull();
            } finally {
                Storage.prototype.getItem = originalGetItem;
            }
        });
    });

    describe('setStoredTheme', () => {
        it('writes to localStorage', () => {
            setStoredTheme('light');
            expect(localStorage.getItem('darylsh:theme')).toBe('light');
        });

        it('does not throw when localStorage is disabled', () => {
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = vi.fn(() => {
                throw new Error('localStorage disabled');
            });
            try {
                expect(() => setStoredTheme('light')).not.toThrow();
            } finally {
                Storage.prototype.setItem = originalSetItem;
            }
        });
    });

    describe('getSystemTheme', () => {
        it('returns "light" when prefers-color-scheme is light', () => {
            vi.spyOn(window, 'matchMedia').mockImplementation(
                (query: string) =>
                    ({
                        matches: query === '(prefers-color-scheme: light)',
                        media: query,
                        onchange: null,
                        addListener: vi.fn(),
                        removeListener: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as MediaQueryList
            );
            expect(getSystemTheme()).toBe('light');
        });

        it('returns "dark" when prefers-color-scheme is dark', () => {
            vi.spyOn(window, 'matchMedia').mockImplementation(
                (query: string) =>
                    ({
                        matches: query === '(prefers-color-scheme: dark)',
                        media: query,
                        onchange: null,
                        addListener: vi.fn(),
                        removeListener: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as MediaQueryList
            );
            expect(getSystemTheme()).toBe('dark');
        });
    });

    describe('getTheme', () => {
        it('returns stored theme when present', () => {
            localStorage.setItem('darylsh:theme', 'light');
            expect(getTheme()).toBe('light');
        });

        it('returns system theme when nothing is stored', () => {
            vi.spyOn(window, 'matchMedia').mockImplementation(
                (query: string) =>
                    ({
                        matches: query === '(prefers-color-scheme: dark)',
                        media: query,
                        onchange: null,
                        addListener: vi.fn(),
                        removeListener: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as MediaQueryList
            );
            expect(getTheme()).toBe('dark');
        });

        it('stored theme takes precedence over system theme', () => {
            localStorage.setItem('darylsh:theme', 'light');
            vi.spyOn(window, 'matchMedia').mockImplementation(
                (query: string) =>
                    ({
                        matches: query === '(prefers-color-scheme: dark)',
                        media: query,
                        onchange: null,
                        addListener: vi.fn(),
                        removeListener: vi.fn(),
                        addEventListener: vi.fn(),
                        removeEventListener: vi.fn(),
                        dispatchEvent: vi.fn(),
                    }) as MediaQueryList
            );
            expect(getTheme()).toBe('light');
        });
    });

    describe('setTheme', () => {
        it('sets the data-theme attribute on the document element', () => {
            setTheme('light');
            expect(document.documentElement.dataset.theme).toBe('light');
        });

        it('persists the theme in localStorage', () => {
            setTheme('light');
            expect(localStorage.getItem('darylsh:theme')).toBe('light');
        });

        it('dispatches a "themechange" event on the document', () => {
            const handler = vi.fn();
            document.addEventListener('themechange', handler);
            setTheme('light');
            expect(handler).toHaveBeenCalledTimes(1);
            const event = handler.mock.calls[0]?.[0] as CustomEvent<{ theme: Theme }>;
            expect(event.detail.theme).toBe('light');
        });
    });

    describe('toggleTheme', () => {
        it('switches from light to dark', () => {
            localStorage.setItem('darylsh:theme', 'light');
            expect(toggleTheme()).toBe('dark');
            expect(getTheme()).toBe('dark');
        });

        it('switches from dark to light', () => {
            localStorage.setItem('darylsh:theme', 'dark');
            expect(toggleTheme()).toBe('light');
            expect(getTheme()).toBe('light');
        });

        it('persists the new theme in localStorage', () => {
            localStorage.setItem('darylsh:theme', 'light');
            toggleTheme();
            expect(localStorage.getItem('darylsh:theme')).toBe('dark');
        });
    });
});
