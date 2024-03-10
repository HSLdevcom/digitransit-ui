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
import {
  mapVehicleRentalFromStore,
  mapVehicleRentalToStore,
} from '../util/vehicleRentalUtils';

// internal data model for vehicle rental stations has changed
// however, data is stored in old form for compatibility
function mapFromStore(favourites) {
  return favourites.map(favourite =>
    favourite.type === 'bikeStation'
      ? mapVehicleRentalFromStore(favourite)
      : favourite,
  );
}

function mapToStore(favourites) {
  return favourites.map(favourite =>
    favourite.type === 'bikeStation'
      ? mapVehicleRentalToStore(favourite)
      : favourite,
  );
}

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
      this.mappedFavourites = mapFromStore(this.favourites);
    } else {
      this.status = FavouriteStore.STATUS_FETCHING_OR_UPDATING;
    }
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

  set(favs) {
    this.favourites = favs;
    this.mappedFavourites = mapFromStore(this.favourites);
    this.fetchComplete();
  }

  fetchFavourites() {
    this.fetchingOrUpdating();
    getFavourites()
      .then(res => {
        if (this.config.allowFavouritesFromLocalstorage) {
          this.mergeWithLocalstorage(res);
        } else {
          this.set(res);
        }
      })
      .catch(() => {
        if (this.config.allowFavouritesFromLocalstorage) {
          this.set(getFavouriteStorage());
        } else {
          this.fetchFailed();
        }
      });
  }

  getStatus() {
    return this.status;
  }

  isFavourite(id, type) {
    for (let i = 0; i < this.favourites.length; i++) {
      const favourite = this.favourites[i];
      const fid = favourite.gtfsId || favourite.gid;
      if (favourite.type === type && fid === id) {
        return true;
      }
    }
    return false;
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
    this.mappedFavourites = [];
    this.storeFavourites();
    this.emitChange();
  }

  getFavourites() {
    return this.mappedFavourites;
  }

  getByGtfsId(gtfsId, type) {
    return find(
      this.mappedFavourites,
      favourite => gtfsId === favourite.gtfsId && type === favourite.type,
    );
  }

  getByStationIdAndNetworks(stationId, network) {
    return find(
      this.mappedFavourites,
      favourite =>
        stationId === favourite.stationId && network === favourite.network,
    );
  }

  getRouteGtfsIds() {
    return this.mappedFavourites
      .filter(favourite => favourite.type === 'route')
      .map(favourite => favourite.gtfsId);
  }

  getStopsAndStations() {
    return this.mappedFavourites.filter(
      favourite => favourite.type === 'stop' || favourite.type === 'station',
    );
  }

  getStops() {
    return this.mappedFavourites.filter(favourite => favourite.type === 'stop');
  }

  getLocations() {
    return this.mappedFavourites.filter(
      favourite => favourite.type === 'place',
    );
  }

  getVehicleRentalStations() {
    return this.mappedFavourites.filter(
      favourite => favourite.type === 'bikeStation',
    );
  }

  /**
   * Merges array of favourites with favourites from localstorage and returns uniques by favouriteId and gtfsId.
   * If there are duplicates by favouriteId or gtfsId, newer one is saved (by lastUpdated field)
   * @param {array} arrayOfFavourites array of favourites
   */
  mergeWithLocalstorage(arrayOfFavourites) {
    const storage = getFavouriteStorage();
    if (isEmpty(storage)) {
      this.set(arrayOfFavourites);
      return;
    }

    updateFavourites(storage)
      .then(res => {
        this.set(res);
        clearFavouriteStorage();
      })
      .catch(() => {
        this.set(arrayOfFavourites);
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
          this.set(res);
        })
        .catch(() => {
          onFail();
          if (this.config.allowFavouritesFromLocalstorage) {
            this.set(newFavourites);
            setFavouriteStorage(this.favourites);
          }
          this.fetchComplete();
        });
    } else {
      this.set(newFavourites);
      setFavouriteStorage(this.favourites);
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
    const mapped = mapToStore(newFavourites);
    this.fetchingOrUpdating();
    if (this.config.allowLogin) {
      // Update favourites to backend service
      updateFavourites(mapped)
        .then(res => {
          this.set(res);
        })
        .catch(() => {
          onFail();
          if (this.config.allowFavouritesFromLocalstorage) {
            this.set(mapped);
            setFavouriteStorage(this.favourites);
          }
          this.fetchComplete();
        });
    } else {
      this.set(mapped);
      setFavouriteStorage(this.favourites);
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
          this.set(res);
        })
        .catch(() => {
          onFail();
          if (this.config.allowFavouritesFromLocalstorage) {
            this.set(newFavourites);
            setFavouriteStorage(this.favourites);
          }
          this.fetchComplete();
        });
    } else {
      this.set(newFavourites);
      setFavouriteStorage(this.favourites);
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
