// src/utils/languageMapping.ts
import { Language } from '../enums/UserEnums';

// Mapping between UserSettings Language enum and i18n language codes
export const LANGUAGE_MAPPING: Record<Language, string> = {
  [Language.ENGLISH]: 'en',
  [Language.SPANISH]: 'es',
  [Language.FRENCH]: 'fr',
  [Language.HINDI]: 'hi',
};

// Reverse mapping from i18n codes to Language enum
export const I18N_TO_LANGUAGE_MAPPING: Record<string, Language> = {
  'en': Language.ENGLISH,
  'es': Language.SPANISH,
  'fr': Language.FRENCH,
  'hi': Language.HINDI,
};

// Get i18n language code from Language enum
export const getI18nCode = (language: Language | null): string => {
  if (!language) return 'en'; // Default to English
  return LANGUAGE_MAPPING[language] || 'en';
};

// Get Language enum from i18n code
export const getLanguageFromI18nCode = (i18nCode: string): Language => {
  return I18N_TO_LANGUAGE_MAPPING[i18nCode] || Language.ENGLISH;
};

// Get language label for dropdown from i18n code
export const getLanguageLabelFromI18nCode = (i18nCode: string): string => {
  const language = getLanguageFromI18nCode(i18nCode);
  const labels: Record<Language, string> = {
    [Language.ENGLISH]: 'English',
    [Language.SPANISH]: 'Español',
    [Language.FRENCH]: 'Français',
    [Language.HINDI]: 'हिंदी',
  };
  return labels[language];
};

// Check if current language should be preserved based on authentication
export const shouldPreserveUserLanguage = (isAuthenticated: boolean): boolean => {
  return isAuthenticated;
};

// Get default language for authentication state
export const getDefaultLanguageForAuthState = (isAuthenticated: boolean): string => {
  if (!isAuthenticated) {
    return 'en'; // Always English for public pages
  }
  
  // For authenticated users, try to get saved preference or default to English
  const savedLang = localStorage.getItem('i18nextLng');
  return savedLang && ['en', 'es', 'fr', 'hi'].includes(savedLang) ? savedLang : 'en';
};