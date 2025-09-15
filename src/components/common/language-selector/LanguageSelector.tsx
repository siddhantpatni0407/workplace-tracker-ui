import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import './language-selector.css';

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

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="language-selector dropdown">
      <button
        className="btn btn-outline-secondary btn-sm dropdown-toggle d-flex align-items-center gap-2"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        title="Change Language"
      >
        <span className="flag-emoji">{currentLanguage.flag}</span>
        <span className="d-none d-md-inline">{currentLanguage.name}</span>
        <span className="d-md-none">{currentLanguage.code.toUpperCase()}</span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {languages.map((lang) => (
          <li key={lang.code}>
            <button
              className={`dropdown-item d-flex align-items-center gap-2 ${
                language === lang.code ? 'active' : ''
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <span className="flag-emoji">{lang.flag}</span>
              <span>{lang.name}</span>
              {language === lang.code && (
                <i className="bi bi-check-lg ms-auto text-success"></i>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSelector;