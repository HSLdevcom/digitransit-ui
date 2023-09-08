import Store from 'fluxible/addons/BaseStore';
import { getCountries, setCountries } from './localStorage';

class CountryStore extends Store {
  static handlers = {
    UpdateCountries: 'updateCountries',
  };

  static storeName = 'CountryStore';

  countries = getCountries();

  getCountries = () => {
    return this.countries;
  };

  updateCountries = countries => {
    this.countries = countries;
    setCountries(countries);
    this.emitChange();
  };
}

export default CountryStore;
