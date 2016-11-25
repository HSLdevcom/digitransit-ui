import Store from 'fluxible/addons/BaseStore';
import reactCookie from 'react-cookie';
import config from '../config';

function loadLanguage() {
  let language = reactCookie.load('lang');

  if (config.availableLanguages.indexOf(language) === -1) { // illegal selection, use default
    language = config.defaultLanguage;
  }

  return language;
}

/* Language is stored in cookie, server should set the language based on browser
 * accepted languages
 */
class PreferencesStore extends Store {
  static storeName = 'PreferencesStore';

  language = loadLanguage();

  getLanguage() {
    return this.language;
  }

  setLanguage(language) {
    if (config.availableLanguages.indexOf(language) === -1) {
      return;
    }

    reactCookie.save('lang', language, { maxAge: 365 * 24 * 60 * 60 }); // Good up to one year
    this.language = language;
    this.emitChange();
  }

  static handlers = {
    SetLanguage: 'setLanguage',
  };
}

export default PreferencesStore;
