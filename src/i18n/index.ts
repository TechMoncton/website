import en from './translations/en.json';
import fr from './translations/fr.json';

export const languages = {
  en: 'English',
  fr: 'Français',
} as const;

export type Language = keyof typeof languages;

export const defaultLang: Language = 'en';

const translations = { en, fr } as const;

type TranslationValue = string | { [key: string]: TranslationValue };

function getNestedValue(obj: TranslationValue, path: string): string {
  const keys = path.split('.');
  let current: TranslationValue = obj;

  for (const key of keys) {
    if (typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, TranslationValue>)[key];
    } else {
      return path; // Return the key if not found
    }
  }

  return typeof current === 'string' ? current : path;
}

export function useTranslations(lang: Language) {
  return function t(key: string): string {
    return getNestedValue(translations[lang] as unknown as TranslationValue, key);
  };
}

export function getLanguageFromURL(url: URL): Language {
  const [, lang] = url.pathname.split('/');

  if (lang && lang in languages) {
    return lang as Language;
  }
  return defaultLang;
}

export function getLocalizedPath(path: string, lang: Language): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${lang}/${cleanPath}`.replace(/\/+$/, '') || `/${lang}`;
}

export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return defaultLang;

  // Check localStorage first
  const stored = localStorage.getItem('preferredLanguage');
  if (stored && stored in languages) {
    return stored as Language;
  }

  // Check browser preference
  const browserLang = navigator.language.split('-')[0];
  if (browserLang in languages) {
    return browserLang as Language;
  }

  return defaultLang;
}

export function setLanguagePreference(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLanguage', lang);
  }
}
