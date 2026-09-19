import React, { createContext, useContext, useState, useEffect } from 'react';
import { INDIAN_LANGUAGES, SupportedLanguage, UI_TRANSLATIONS, COURSE_TRANSLATIONS } from '../data/translations';
import { Course } from '../types';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  allLanguages: SupportedLanguage[];
  setLanguageByCode: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  getCourseTranslation: (course: Course) => { title: string; subtitle: string; badge?: string };
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'nextclass_selected_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCode, setCurrentCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const currentLanguage =
    INDIAN_LANGUAGES.find((lang) => lang.code === currentCode) || INDIAN_LANGUAGES[0];

  const setLanguageByCode = (code: string) => {
    setIsTranslating(true);
    setCurrentCode(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
    setTimeout(() => {
      setIsTranslating(false);
    }, 250);
  };

  const t = (key: string, fallback?: string): string => {
    if (currentLanguage.code === 'en') {
      return fallback || UI_TRANSLATIONS[key]?.en || key;
    }
    const dict = UI_TRANSLATIONS[key];
    if (dict && dict[currentLanguage.code]) {
      return dict[currentLanguage.code];
    }
    return fallback || dict?.en || key;
  };

  const getCourseTranslation = (course: Course) => {
    if (currentLanguage.code === 'en') {
      return {
        title: course.title,
        subtitle: course.subtitle,
        badge: course.badge,
      };
    }

    const courseDict = COURSE_TRANSLATIONS[course.id];
    if (courseDict && courseDict[currentLanguage.code]) {
      const translated = courseDict[currentLanguage.code];
      return {
        title: translated.title || course.title,
        subtitle: translated.subtitle || course.subtitle,
        badge: translated.badge || course.badge,
      };
    }

    // Fallback if not specifically pre-compiled: return original course info
    return {
      title: course.title,
      subtitle: course.subtitle,
      badge: course.badge,
    };
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        allLanguages: INDIAN_LANGUAGES,
        setLanguageByCode,
        t,
        getCourseTranslation,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
