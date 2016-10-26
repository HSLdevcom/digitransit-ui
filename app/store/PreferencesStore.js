import Store from 'fluxible/addons/BaseStore';
import reactCookie from 'react-cookie';
import config from '../config';

/* Language is stored in cookie, server should set the language based on browser
 * accepted languages
 */
class PreferencesStore extends Store {
  static storeName = 'PreferencesStore';

  // eslint-disable-next-line class-methods-use-this
  getLanguage() {
    let lang = reactCookie.load('lang');

    if (config.availableLanguages.indexOf(lang) === -1) { // illegal selection, use default
      lang = config.defaultLanguage;
    }

    return lang;
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
