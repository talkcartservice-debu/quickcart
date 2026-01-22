import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, getAvailableLanguages, t } = useLanguage();

  const languages = {
    en: 'English',
    fr: 'Français'
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    changeLanguage(selectedLanguage);
  };

  return (
    <div className="relative">
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-8"
        aria-label={t('common.language_selector', { label: t('common.language') })}
      >
        {getAvailableLanguages().map((lang) => (
          <option key={lang} value={lang}>
            {languages[lang] || lang.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageSelector;