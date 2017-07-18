import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import {
  getFavouriteStopsStorage,
  setFavouriteStopsStorage,
} from './localStorage';

class FavouriteStopsStore extends Store {
  static storeName = 'FavouriteStopsStore';

  stops = this.getStops();

  // eslint-disable-next-line class-methods-use-this
  getStops() {
    return getFavouriteStopsStorage();
  }

  isFavourite(id) {
    return includes(this.stops, id);
  }

  storeStops() {
    setFavouriteStopsStorage(this.stops);
  }

  toggleFavouriteStop(stopId) {
    if (typeof stopId !== 'string') {
      throw new Error(`stopId is not a string:${JSON.stringify(stopId)}`);
    }

    const newStops = this.stops.filter(id => id !== stopId);

    if (newStops.length === this.stops.length) {
      newStops.push(stopId);
    }

    this.stops = newStops;
    this.storeStops();
    this.emitChange(stopId);
  }

  static handlers = {
    AddFavouriteStop: 'toggleFavouriteStop',
  };
}

export default FavouriteStopsStore;
