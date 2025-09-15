// i18n configuration
// After installing packages: npm install react-i18next i18next i18next-browser-languagedetector
// Uncomment the imports below and remove this comment block

/*
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
*/

// Import translation files
import enTranslations from './locales/en_US_message.json';
import esTranslations from './locales/es_ES_message.json';
import frTranslations from './locales/fr_FR_message.json';
import hiTranslations from './locales/hi_IN_message.json';

// Simple i18n implementation without packages (temporary)
export interface I18nInstance {
  t: (key: string, options?: { [key: string]: any }) => string;
  changeLanguage: (lng: string) => void;
  language: string;
}

class SimpleI18n implements I18nInstance {
  private currentLanguage: string = 'en';
  private translations: { [key: string]: any } = {
    en: enTranslations,
    es: esTranslations,
    fr: frTranslations,
    hi: hiTranslations,
  };

  constructor() {
    // Try to get language from localStorage
    const savedLang = localStorage.getItem('i18nextLng');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
  }

  get language(): string {
    return this.currentLanguage;
  }

  t = (key: string, options?: { [key: string]: any }): string => {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'string') {
      if (options) {
        // Simple interpolation
        return value.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
          return options[varName] || match;
        });
      }
      return value;
    }
    
    // Fallback to English if not found
    if (this.currentLanguage !== 'en') {
      let fallbackValue: any = this.translations['en'];
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
      }
      if (typeof fallbackValue === 'string') {
        if (options) {
          return fallbackValue.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
            return options[varName] || match;
          });
        }
        return fallbackValue;
      }
    }
    
    return key; // Return key if translation not found
  };

  changeLanguage = (lng: string): void => {
    if (this.translations[lng]) {
      this.currentLanguage = lng;
      localStorage.setItem('i18nextLng', lng);
      // Trigger re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: lng }));
    }
  };
}

const i18n = new SimpleI18n();

export default i18n;

/*
// Real i18next configuration (uncomment after installing packages)
const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
  fr: {
    translation: frTranslations,
  },
  hi: {
    translation: hiTranslations,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'sessionStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
    },
    defaultNS: 'translation',
    ns: ['translation'],
    react: {
      useSuspense: false,
    },
  });

export default i18n;
*/