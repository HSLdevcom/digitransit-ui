import Store from 'fluxible/addons/BaseStore';
import find from 'lodash/find';
import {
  getFavouriteStopsStorage,
  setFavouriteStopsStorage,
} from './localStorage';

class FavouriteStopsStore extends Store {
  static storeName = 'FavouriteStopsStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.stops = this.getStops();
  }

  // eslint-disable-next-line class-methods-use-this
  getStops() {
    return getFavouriteStopsStorage();
  }

  getById = id => find(this.stops, stop => id === stop.id);

  isFavourite(id) {
    return find(this.stops, { id });
  }

  storeStops() {
    setFavouriteStopsStorage(this.stops);
  }

  addFavouriteStop(stop) {
    if (typeof stop !== 'object') {
      throw new Error(`stop is not a object:${JSON.stringify(stop)}`);
    }

    if (this.isFavourite(stop.id)) {
      // update
      this.stops = this.stops.map(currentStop => {
        if (currentStop.id === stop.id) {
          return stop;
        }
        return currentStop;
      });
    } else {
      // insert
      this.stops.push(stop);
    }

    this.storeStops();
    this.emitChange();
  }

  static handlers = {
    AddFavouriteStop: 'addFavouriteStop',
  };
}

export default FavouriteStopsStore;
