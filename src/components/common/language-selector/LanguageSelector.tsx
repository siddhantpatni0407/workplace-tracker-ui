import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './languageselector.css';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

const LanguageSelector: React.FC = () => {
  const { i18n, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
    
    // Note: When user changes language from navbar, it will be immediately reflected
    // and if they have user settings page open, it will sync there too via the useEffect in UserSettings
    // However, to persist this change to their user settings in the database,
    // they need to go to User Settings page and click Save
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        title="Change Language"
      >
        <span className="flag-emoji">{currentLanguage.flag}</span>
        <span className="language-text d-none d-md-inline">{currentLanguage.name}</span>
        <span className="language-code d-md-none">{currentLanguage.code.toUpperCase()}</span>
        <i className={`bi bi-chevron-down dropdown-arrow ${isOpen ? 'open' : ''}`}></i>
      </button>
      
      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-item ${language === lang.code ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="flag-emoji">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
              <span className="language-code">{lang.code.toUpperCase()}</span>
              {language === lang.code && (
                <i className="bi bi-check-lg check-icon"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
