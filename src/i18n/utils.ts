import { i18n, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
    const [, lang] = url.pathname.split('/');
    if (lang in i18n) return lang as keyof typeof i18n;
    return defaultLang;
}

export function useTranslations(lang: keyof typeof i18n) {
    return function t(key: keyof typeof i18n[typeof defaultLang]) {
        return i18n[lang][key] || i18n[defaultLang][key];
    }
}
