import Store from 'fluxible/addons/BaseStore';
import reactCookie from 'react-cookie';
import config from '../config';

/* Language is stored in cookie, server should set the language based on browser
 * accepted languages
 */
class PreferencesStore extends Store {
  static storeName = 'PreferencesStore';

  getLanguage() {
    const lang = reactCookie.load('lang');

    // 1. use user selected language from cookie
    if (lang !== undefined) {
      return lang;
    }

    // fallback to default language
    return config.defaultLanguage;
  }

  setLanguage(language) {
    if (config.availableLanguages.indexOf(language) === -1) {
      return;
    }

    if (document) {
      document.cookie = `lang=${language}`;
    }

    this.emitChange({
      lang: language,
    });
  }

  static handlers = {
    SetLanguage: 'setLanguage',
  };
}

export default PreferencesStore;
