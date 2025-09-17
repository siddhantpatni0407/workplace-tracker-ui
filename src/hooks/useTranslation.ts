import { useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';

// Custom hook to provide translation functionality
export const useTranslation = () => {
  const [language, setLanguage] = useState(i18n.language);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail);
      // Force re-render by updating a dummy state
      forceUpdate(prev => prev + 1);
    };

    window.addEventListener('languageChanged', handleLanguageChange as EventListener);
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener);
    };
  }, []);

  // Create a t function that always uses the current language from i18n instance
  const t = useCallback((key: string, options?: { [key: string]: any }): string => {
    return i18n.t(key, options);
  }, []);

  return {
    t,
    i18n,
    language,
  };
};

// Type for translation function
export type TFunction = typeof i18n.t;