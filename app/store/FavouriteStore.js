import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import {
  clearFavouriteStorage,
  getFavouriteStorage,
  setFavouriteStorage,
} from './localStorage';
import {
  deleteFavourites,
  getFavourites,
  updateFavourites,
} from '../util/apiUtils';
import { getIdWithoutFeed } from '../util/feedScopedIdUtils';
import {
  mapVehicleRentalFromStore,
  mapVehicleRentalToStore,
} from '../util/vehicleRentalUtils';

export default class FavouriteStore extends Store {
  static storeName = 'FavouriteStore';

  static STATUS_FETCHING_OR_UPDATING = 'fetching';

  static STATUS_HAS_DATA = 'has-data';

  static FETCH_FAILED = 'fetch-failed';

  favourites = [];

  config = {};

  status = null;

  constructor(dispatcher) {
    super(dispatcher);
    this.config = dispatcher.getContext().config;
    if (!this.config.allowLogin) {
      this.favourites = getFavouriteStorage();
    } else {
      this.status = FavouriteStore.STATUS_FETCHING_OR_UPDATING;
    }
    // this.migrateRoutes();
    // this.migrateStops();
    // this.migrateLocations();
  }

  fetchComplete() {
    this.status = FavouriteStore.STATUS_HAS_DATA;
    this.emitChange();
  }

  fetchingOrUpdating() {
    this.status = FavouriteStore.STATUS_FETCHING_OR_UPDATING;
    this.emitChange();
  }

  fetchFailed() {
    this.status = FavouriteStore.FETCH_FAILED;
    this.emitChange();
  }

  fetchFavourites() {
    this.fetchingOrUpdating();
    getFavourites()
      .then(res => {
        if (this.config.allowFavouritesFromLocalstorage) {
          this.mergeWithLocalstorage(res);
        } else {
          this.favourites = res;
          this.fetchComplete();
        }
      })
      .catch(() => {
        if (this.config.allowFavouritesFromLocalstorage) {
          this.favourites = getFavouriteStorage();
          this.fetchComplete();
        } else {
          this.fetchFailed();
        }
      });
  }

  getStatus() {
    return this.status;
  }

  isFavourite(id, type) {
    const ids = this.favourites
      .filter(favourite => favourite.type === type)
      .map(favourite => favourite.gtfsId || favourite.gid);
    return includes(ids, id);
  }

  isFavouriteVehicleRentalStation(id, network) {
    const ids = this.favourites
      .filter(
        favourite =>
          favourite.type === 'bikeStation' && favourite.networks[0] === network,
      )
      .map(favourite => `${favourite.networks[0]}:${favourite.stationId}`);
    return includes(ids, id);
  }

  clearFavourites() {
    clearFavouriteStorage();
    this.favourites = [];
    this.storeFavourites();
    this.emitChange();
  }

  storeFavourites() {
    setFavouriteStorage(this.favourites);
  }

  getFavourites() {
    return this.favourites.map(favourite =>
      favourite.type === 'bikeStation'
        ? mapVehicleRentalFromStore(favourite)
        : favourite,
    );
  }

  getByGtfsId(gtfsId, type) {
    return find(
      this.favourites,
      favourite => gtfsId === favourite.gtfsId && type === favourite.type,
    );
  }

  getByStationIdAndNetworks(stationId, network) {
    return find(
      this.favourites,
      favourite =>
        getIdWithoutFeed(stationId) === favourite.stationId &&
        favourite.networks[0] === network,
    );
  }

  getRouteGtfsIds() {
    return this.favourites
      .filter(favourite => favourite.type === 'route')
      .map(favourite => favourite.gtfsId);
  }

  getStopsAndStations() {
    return this.favourites.filter(
      favourite => favourite.type === 'stop' || favourite.type === 'station',
    );
  }

  getStops() {
    return this.favourites.filter(favourite => favourite.type === 'stop');
  }

  getLocations() {
    return this.favourites.filter(favourite => favourite.type === 'place');
  }

  getVehicleRentalStations() {
    return this.favourites
      .filter(favourite => favourite.type === 'bikeStation')
      .map(favourite => mapVehicleRentalFromStore(favourite));
  }

  /**
   * Merges array of favourites with favourites from localstorage and returns uniques by favouriteId and gtfsId.
   * If there are duplicates by favouriteId or gtfsId, newer one is saved (by lastUpdated field)
   * @param {array} arrayOfFavourites array of favourites
   */
  mergeWithLocalstorage(arrayOfFavourites) {
    const storage = getFavouriteStorage();
    if (isEmpty(storage)) {
      this.favourites = arrayOfFavourites;
      this.fetchComplete();
      return;
    }

    updateFavourites(storage)
      .then(res => {
        this.favourites = res;
        clearFavouriteStorage();
        this.fetchComplete();
      })
      .catch(() => {
        this.favourites = arrayOfFavourites;
        this.fetchComplete();
      });
  }

  /**
   * Saves (or updates) favourite.
   * Triggers onFail callback function when storing favourite fails.
   * Generates or updates lastUpdated epoch and for new favourites,
   * it also generates favouriteId.
   *
   * @param {*} actionData object containing favourite data
   * and on fail callback function under onFail key
   */
  saveFavourite(actionData) {
    let { ...data } = actionData;
    const { onFail } = actionData;
    if (typeof data !== 'object') {
      onFail();
      throw new Error(`New favourite is not a object:${JSON.stringify(data)}`);
    }
    this.fetchingOrUpdating();
    if (data.type === 'bikeStation') {
      data = mapVehicleRentalToStore(data);
    }
    const newFavourites = this.favourites.slice();
    const editIndex = findIndex(
      this.favourites,
      item => data.favouriteId === item.favouriteId,
    );
    if (editIndex >= 0) {
      newFavourites[editIndex] = {
        ...data,
        lastUpdated: moment().unix(),
      };
    } else {
      newFavourites.push({
        ...data,
        lastUpdated: moment().unix(),
        favouriteId: uuid(),
      });
    }
    if (this.config.allowLogin) {
      // Update favourites to backend service
      updateFavourites(newFavourites)
        .then(res => {
          this.favourites = res;
          this.fetchComplete();
        })
        .catch(() => {
          onFail();
          if (this.config.allowFavouritesFromLocalstorage) {
            this.favourites = newFavourites;
            this.storeFavourites();
          }
          this.fetchComplete();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.fetchComplete();
    }
  }

  /**
   * Replaces existing array of favourites with an updated array of favourites.
   *
   * @param {*} actionData object containing array of new favourites
   * and on fail callback function under onFail key
   */
  updateFavourites(actionData) {
    const { onFail, newFavourites } = actionData;
    if (!Array.isArray(newFavourites)) {
      onFail();
      throw new Error(
        `New favourites is not an array:${JSON.stringify(newFavourites)}`,
      );
    }
    const newFavouriteMapped = newFavourites.map(favourite =>
      favourite.type === 'bikeStation'
        ? mapVehicleRentalToStore(favourite)
        : favourite,
    );
    this.fetchingOrUpdating();
    if (this.config.allowLogin) {
      // Update favourites to backend service
      updateFavourites(newFavouriteMapped)
        .then(res => {
          this.favourites = res;
          this.fetchComplete();
        })
        .catch(() => {
          onFail();
          if (this.config.allowFavouritesFromLocalstorage) {
            this.favourites = newFavouriteMapped;
            this.storeFavourites();
          }
          this.fetchComplete();
        });
    } else {
      this.favourites = newFavouriteMapped;
      this.storeFavourites();
      this.fetchComplete();
    }
  }

  /**
   * Deletes given favourite if one exists in store.
   *
   * @param {*} actionData object containing data for favourite to be deleted
   * and on fail callback function under onFail key
   */
  deleteFavourite(actionData) {
    const { onFail, ...data } = actionData;
    if (typeof data !== 'object') {
      onFail();
      throw new Error(`Favourite is not an object:${JSON.stringify(data)}`);
    }
    this.fetchingOrUpdating();
    const newFavourites = this.favourites.filter(
      favourite => favourite.favouriteId !== data.favouriteId,
    );
    if (this.config.allowLogin) {
      // Delete favourite from backend service
      deleteFavourites([data.favouriteId])
        .then(res => {
          this.favourites = res;
          this.fetchComplete();
        })
        .catch(() => {
          onFail();
          if (this.config.allowFavouritesFromLocalstorage) {
            this.favourites = newFavourites;
            this.storeFavourites();
          }
          this.fetchComplete();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.fetchComplete();
    }
  }

  static handlers = {
    SaveFavourite: 'saveFavourite',
    UpdateFavourites: 'updateFavourites',
    DeleteFavourite: 'deleteFavourite',
    FetchFavourites: 'fetchFavourites',
    FetchFavouritesComplete: 'fetchComplete',
  };
}
