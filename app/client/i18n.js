import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  fallbackLng: 'fi',
  defaultNS: 'translation',
  // debug: true,
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
  resources: {},
  react: {
    useSuspense: true,
  },
});

export default i18n;
