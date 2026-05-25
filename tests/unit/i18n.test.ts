import { describe, it, expect } from 'vitest';
import { getLangFromUrl, useTranslations } from '../../src/i18n/utils';

describe('i18n utilities', () => {
    describe('getLangFromUrl', () => {
        it('should extract valid ES language from URL', () => {
            const url = new URL('http://localhost/es/projects');
            expect(getLangFromUrl(url)).toBe('es');
        });

        it('should extract valid EN language from URL', () => {
            const url = new URL('http://localhost/en/about');
            expect(getLangFromUrl(url)).toBe('en');
        });

        it('should return default lang (es) for invalid language', () => {
            const url = new URL('http://localhost/xyz/unknown');
            expect(getLangFromUrl(url)).toBe('es');
        });

        it('should return default lang (es) for root path', () => {
            const url = new URL('http://localhost/es/');
            expect(getLangFromUrl(url)).toBe('es');
        });

        it('should return default lang (es) for no lang prefix', () => {
            const url = new URL('http://localhost/projects');
            expect(getLangFromUrl(url)).toBe('es');
        });

        it('should return default lang (es) for empty lang', () => {
            const url = new URL('http://localhost//projects');
            expect(getLangFromUrl(url)).toBe('es');
        });
    });

    describe('useTranslations', () => {
        const tEs = useTranslations('es');
        const tEn = useTranslations('en');

        it('should return correct ES translation for valid key', () => {
            expect(tEs('nav.projects')).toBe('Proyectos');
        });

        it('should return correct EN translation for valid key', () => {
            expect(tEn('nav.projects')).toBe('Projects');
        });

        it('should return correct ES translation for hero.badge', () => {
            expect(tEs('hero.badge')).toBe('Disponible para nuevos proyectos');
        });

        it('should return correct EN translation for hero.badge', () => {
            expect(tEn('hero.badge')).toBe('Available for new projects');
        });

        it('should return undefined for a key not present in any language', () => {
            // @ts-expect-error testing runtime behavior with an invalid key
            expect(tEn('nonexistent.key')).toBeUndefined();
        });

        it('should return correct translation for nav.about ES', () => {
            expect(tEs('nav.about')).toBe('Sobre mí');
        });

        it('should return correct translation for nav.about EN', () => {
            expect(tEn('nav.about')).toBe('About');
        });
    });
});