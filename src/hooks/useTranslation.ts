import { useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';

// Custom hook to provide translation functionality
export const useTranslation = () => {
  const [language, setLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  // Create a memoized t function that depends on the current language
  // This ensures React components re-render when the language changes
  // The 'language' dependency is intentional to trigger re-renders
  const t = useCallback((key: string, options?: { [key: string]: any }): string => {
    return i18n.t(key, options);
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    t,
    i18n,
    language,
  };
};

// Type for translation function
export type TFunction = typeof i18n.t;