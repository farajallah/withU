import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation files
import en from '../locales/en.json';
import tr from '../locales/tr.json';
import ar from '../locales/ar.json';

const LANGUAGE_STORAGE_KEY = 'user_language';

// Language detector for AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // First try to get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // Fall back to device locale
      const deviceLocale = Localization.locale;
      const languageCode = deviceLocale.split('-')[0];
      
      // Check if we support the device language
      const supportedLanguages = ['en', 'tr', 'ar'];
      const detectedLanguage = supportedLanguages.includes(languageCode) ? languageCode : 'en';
      
      callback(detectedLanguage);
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en'); // Default to English
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

// Helper function to change language
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Helper function to get current language
export const getCurrentLanguage = () => i18n.language;

// Helper function to get available languages
export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];