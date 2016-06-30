import Store from 'fluxible/addons/BaseStore';
import { setPreferencesStorage, getPreferencesStorage } from './localStorage';
import config from '../config';

class PreferencesStore extends Store {
  static storeName = 'PreferencesStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.preferences = this.loadPreferences();
  }

  getLanguage() {
    return this.preferences.language || config.defaultLanguage;
  }

  setLanguage(language) {
    if (config.availableLanguages.indexOf(language) === -1) {
      console.error(`Could not set language ${language} as it is not configured
        as availableLanguage`);

      return;
    }

    this.preferences.language = language;
    this.storePreferences();

    if (document) {
      document.cookie = `lang=${language}`;
    }

    this.emitChange({
      lang: language,
    });
  }

  loadPreferences() {
    if (typeof window !== 'undefined' && window !== null) {
      const preferences = getPreferencesStorage();

      if (typeof preferences.language !== 'undefined') {
        return {
          language: window.locale ? window.locale : config.defaultLanguage,
        };
      }
    }
    return {
      language: config.defaultLanguage,
    };
  }

  storePreferences() {
    return setPreferencesStorage(this.preferences);
  }

  static handlers = {
    SetLanguage: 'setLanguage',
  };
}

export default PreferencesStore;
