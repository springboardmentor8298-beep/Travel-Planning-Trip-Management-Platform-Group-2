import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en.json';
import translationHI from './locales/hi.json';
import translationTE from './locales/te.json';
import translationTA from './locales/ta.json';

const resources = {
  en: { translation: translationEN },
  hi: { translation: translationHI },
  te: { translation: translationTE },
  ta: { translation: translationTA }
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18next;
