import Store from 'fluxible/addons/BaseStore';
import reactCookie from 'react-cookie';

/* Language is stored in cookie, server should set the language based on browser
 * accepted languages
 */
class PreferencesStore extends Store {
  static storeName = 'PreferencesStore';

  constructor(dispatcher) {
    super(dispatcher);
    const config = dispatcher.getContext().config;
    this.availableLanguages = config.availableLanguages;
    this.defaultLanguage = config.defaultLanguage;

    const language = reactCookie.load('lang');
    if (this.availableLanguages.indexOf(language) === -1) { // illegal selection, use default
      this.language = this.defaultLanguage;
    } else {
      this.language = language;
    }
  }

  getLanguage() {
    return this.language;
  }

  setLanguage(language) {
    if (this.availableLanguages.indexOf(language) === -1) {
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
