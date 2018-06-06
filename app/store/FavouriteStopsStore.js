import Store from 'fluxible/addons/BaseStore';
import maxBy from 'lodash/maxBy';
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

  isFavourite(gtfsId) {
    return find(this.stops, { gtfsId });
  }

  getMaxId = collection => (maxBy(collection, stop => stop.id) || { id: 0 }).id;

  storeStops() {
    setFavouriteStopsStorage(this.stops);
  }

  addFavouriteStop(stop) {
    if (typeof stop !== 'object') {
      throw new Error(`stop is not a object:${JSON.stringify(stop)}`);
    }

    if (stop.id === undefined) {
      // new
      this.stops.push({
        ...stop,
        id: 1 + this.getMaxId(this.stops),
      });
    } else {
      // update
      this.stops = this.stops.map(currentStop => {
        if (currentStop.id === stop.id) {
          return stop;
        }
        return currentStop;
      });
    }

    this.storeStops();
    this.emitChange();
  }

  deleteFavouriteStop(stop) {
    this.stops = this.stops.filter(currentStop => currentStop.id !== stop.id);
    this.storeStops();
    this.emitChange();
  }

  static handlers = {
    AddFavouriteStop: 'addFavouriteStop',
    DeleteFavouriteStop: 'deleteFavouriteStop',
  };
}

export default FavouriteStopsStore;
