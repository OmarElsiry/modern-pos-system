import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import en from './locales/en.json';
import ar from './locales/ar.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import fa from './locales/fa.json';
import zh from './locales/zh.json';
import fr from './locales/fr.json';

const resources = {
    en: { translation: en },
    ar: { translation: ar },
    ru: { translation: ru },
    de: { translation: de },
    fa: { translation: fa },
    zh: { translation: zh },
    fr: { translation: fr },
};

// Available languages with their display names and direction
export const languages = [
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'fa', name: 'فارسی', dir: 'rtl' },
    { code: 'ru', name: 'Русский', dir: 'ltr' },
    { code: 'de', name: 'Deutsch', dir: 'ltr' },
    { code: 'zh', name: '中文', dir: 'ltr' },
    { code: 'fr', name: 'Français', dir: 'ltr' },
];

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en', // Default to English if language not found
        interpolation: {
            escapeValue: false, // react already safes from xss
            prefix: '{',
            suffix: '}',
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

// Automatically set document direction based on language
i18n.on('languageChanged', (lng) => {
    const isRTL = ['ar', 'fa'].includes(lng);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

// Run once on load
const currentLng = i18n.language || 'en';
const isRTL = ['ar', 'fa'].includes(currentLng);
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
document.documentElement.lang = currentLng;

export default i18n;
