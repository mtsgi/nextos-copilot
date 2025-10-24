import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslation from '@/public/locales/en/translation.json';
import jaTranslation from '@/public/locales/ja/translation.json';
import zhCNTranslation from '@/public/locales/zh-CN/translation.json';
import zhTWTranslation from '@/public/locales/zh-TW/translation.json';
import esTranslation from '@/public/locales/es/translation.json';
import frTranslation from '@/public/locales/fr/translation.json';
import deTranslation from '@/public/locales/de/translation.json';
import arTranslation from '@/public/locales/ar/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ja: {
        translation: jaTranslation,
      },
      'zh-CN': {
        translation: zhCNTranslation,
      },
      'zh-TW': {
        translation: zhTWTranslation,
      },
      es: {
        translation: esTranslation,
      },
      fr: {
        translation: frTranslation,
      },
      de: {
        translation: deTranslation,
      },
      ar: {
        translation: arTranslation,
      },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'nextos-language',
    },
  });

export default i18n;
