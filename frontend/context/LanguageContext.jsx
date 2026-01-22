import React, { createContext, useContext, useState, useEffect } from 'react';

// Import language files
import enTranslations from '../../languages/en.json';
import frTranslations from '../../languages/fr.json';

const LanguageContext = createContext();

const translations = {
  en: enTranslations,
  fr: frTranslations
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // Load language preference from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Set default language based on browser language
      const browserLang = navigator.language.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')
      if (translations[browserLang]) {
        setCurrentLanguage(browserLang);
      }
    }
    setTranslationsLoaded(true);
  }, []);

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  // Function to translate a key with optional interpolation
  const t = (key, interpolation) => {
    if (!translations[currentLanguage]) {
      // Fallback to English if language not found
      return interpolateString(getNestedValue(enTranslations, key) || key, interpolation);
    }

    const translation = getNestedValue(translations[currentLanguage], key);
    
    if (translation === undefined) {
      // Fallback to English if translation not found
      const fallbackTranslation = getNestedValue(enTranslations, key);
      if (fallbackTranslation !== undefined) {
        return interpolateString(fallbackTranslation, interpolation);
      }
      // Return the key as fallback
      return key;
    }

    return interpolateString(translation, interpolation);
  };

  // Helper function to get nested value from object using dot notation
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  // Helper function to interpolate values in string
  const interpolateString = (str, interpolation) => {
    if (!interpolation || typeof str !== 'string') {
      return str;
    }

    let result = str;
    Object.keys(interpolation).forEach(key => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), interpolation[key]);
    });

    return result;
  };

  // Function to change language
  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setCurrentLanguage(lang);
    }
  };

  // Function to get available languages
  const getAvailableLanguages = () => {
    return Object.keys(translations);
  };

  // Function to check if current language is RTL (right-to-left)
  const isRTL = () => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur']; // Add more RTL languages as needed
    return rtlLanguages.includes(currentLanguage);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getAvailableLanguages,
    isRTL,
    translationsLoaded
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};