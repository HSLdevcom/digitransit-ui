import { createInstance } from 'i18next';
import translations from './translations.js';

const i18n = createInstance({
  fallbackLng: 'fi',
  // debug: true,
  resources: translations,
  defaultNS: 'translation',
  react: {
    useSuspense: true,
  },
});

i18n.init();

export default i18n;
