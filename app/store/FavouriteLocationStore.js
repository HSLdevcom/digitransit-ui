import Store from 'fluxible/addons/BaseStore';
import { getFavouriteLocationsStorage, setFavouriteLocationsStorage } from './localStorage';

class FavouriteLocationStore extends Store {
  static storeName = 'FavouriteLocationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.locations = this.getLocations();
  }

  getLocations() {
    return getFavouriteLocationsStorage();
  }

  addFavouriteLocation(location) {
    if (typeof location !== 'object') {
      throw new Error(`location is not a object:${JSON.stringify(location)}`);
    }

    this.locations.push(location);
    return setFavouriteLocationsStorage(this.locations);
  }

  static handlers = {
    'AddFavouriteLocation': 'addFavouriteLocation',
  };
}

export default FavouriteLocationStore;
