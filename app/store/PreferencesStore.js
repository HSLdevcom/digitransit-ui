import Store from 'fluxible/addons/BaseStore';
import Cookies from 'universal-cookie';
import { isLangMockEn } from '../util/browser';

/* Language is stored in cookie, server should set the language based on browser
 * accepted languages
 */
class PreferencesStore extends Store {
  static storeName = 'PreferencesStore';

  constructor(dispatcher) {
    super(dispatcher);

    const { config } = dispatcher.getContext();
    this.availableLanguages = config.availableLanguages;
    this.defaultLanguage = config.defaultLanguage;

    if (isLangMockEn) {
      this.setLanguage('en');
    }
    this.cookies = new Cookies();

    const language = this.cookies.get('lang');
    if (this.availableLanguages.indexOf(language) === -1) {
      // illegal selection, use default
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

    this.cookies.set('lang', language, {
      // Good up to one year
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
      Secure: true,
      SameSite: 'Strict',
    });
    this.language = language;
    this.emitChange();
  }

  static handlers = {
    SetLanguage: 'setLanguage',
  };
}

export default PreferencesStore;
