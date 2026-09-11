import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import isEmpty from 'lodash/isEmpty';
import { v4 as uuid } from 'uuid';
import { unixTime } from '../util/timeUtils';
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

const locationTypes = ['station', 'stop', 'place', 'bikeStation'];

export const STATUS_FETCHING_OR_UPDATING = 'fetching';

export const STATUS_HAS_DATA = 'has-data';

export const STATUS_FETCH_FAILED = 'fetch-failed';

/* fav count excluding routes */
export function countLocations(favourites) {
  let cnt = 0;
  favourites.forEach(favourite => {
    if (locationTypes.includes(favourite.type)) {
      cnt += 1;
    }
  });
  return cnt;
}

export function isFavourite(id, type, favourites) {
  for (let i = 0; i < favourites.length; i++) {
    const favourite = favourites[i];
    const fid = favourite.gtfsId || favourite.gid || favourite.stationId;
    if (favourite.type === type && fid === id) {
      return true;
    }
  }
  return false;
}

export function getFavouriteByGtfsId(gtfsId, type, favourites) {
  return find(
    favourites,
    favourite => gtfsId === favourite.gtfsId && type === favourite.type,
  );
}

export function getFavouriteByStationIdAndNetworks(
  stationId,
  network,
  favourites,
) {
  return find(
    favourites,
    favourite =>
      stationId === favourite.stationId && network === favourite.network,
  );
}

export function getFavouriteRouteGtfsIds(favourites) {
  return favourites
    .filter(favourite => favourite.type === 'route')
    .map(favourite => favourite.gtfsId);
}

export function getFavouriteStopsAndStations(favourites) {
  return favourites.filter(
    favourite => favourite.type === 'stop' || favourite.type === 'station',
  );
}

export function getFavouriteVehicleRentalStations(favourites) {
  return favourites.filter(favourite => favourite.type === 'bikeStation');
}

export function getFavouritePlaces(favourites) {
  return favourites.filter(favourite => favourite.type === 'place');
}

/**
 * Returns the preferences of the 'personalization' favourite, a singleton
 * favourite (at most one exists per user) holding itinerary personalization
 * preferences, e.g. 'weights' (mode multipliers used to rate itineraries).
 * Returns an empty object if no such favourite exists yet, or if it has no
 * preferences saved.
 */
export function getPersonalizationPreferences(favourites) {
  const { type, favouriteId, lastUpdated, ...preferences } =
    find(favourites, favourite => favourite.type === 'personalization') || {};
  return preferences;
}

/**
 * Plain (non-Flux) singleton that holds the current favourites and syncs
 * them with the backend service and/or localStorage. This replaces the
 * former Fluxible FavouriteStore. React components should not use this
 * module's default export directly for reading state; use the
 * useFavourites()/useFavouriteStatus()/useFavouriteActions() hooks exported
 * from hooks/FavouriteContext.js instead, which wrap this singleton and
 * keep components in sync with it.
 *
 * Pure query helpers over a favourites array (isFavourite,
 * getFavouriteByGtfsId, getFavouriteByStationIdAndNetworks,
 * getFavouriteRouteGtfsIds, getFavouriteStopsAndStations,
 * getFavouriteVehicleRentalStations, getFavouritePlaces,
 * getPersonalizationPreferences, countLocations) are exported above as
 * standalone functions rather than methods on this class, so callers always
 * pass the favourites array they actually have (e.g. from useFavourites())
 * instead of implicitly reaching into this singleton's internal state.
 */
class FavouriteData {
  favourites = [];

  config = {};

  status = null;

  listeners = [];

  initialized = false;

  /**
   * Initializes the store with the current config. Called once during app
   * bootstrap in client.js, before anything renders (mirrors
   * SearchContext.init()). Safe to call more than once; only the first
   * call has an effect.
   */
  init(config) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.config = config;
    if (!config.allowLogin) {
      this.favourites = mapFromStore(getFavouriteStorage());
      this.status = STATUS_HAS_DATA;
    } else {
      this.status = STATUS_FETCHING_OR_UPDATING;
    }
  }

  addChangeListener(listener) {
    this.listeners.push(listener);
  }

  removeChangeListener(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  emitChange() {
    this.listeners.forEach(listener => listener());
  }

  fetchComplete() {
    this.status = STATUS_HAS_DATA;
    this.emitChange();
  }

  fetchingOrUpdating() {
    this.status = STATUS_FETCHING_OR_UPDATING;
    this.emitChange();
  }

  fetchFailed() {
    this.status = STATUS_FETCH_FAILED;
    this.emitChange();
  }

  set(favs) {
    this.favourites = mapFromStore(favs);
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

  clearFavourites() {
    clearFavouriteStorage();
    this.favourites = [];
    setFavouriteStorage([]);
    this.emitChange();
  }

  getFavourites() {
    return this.favourites;
  }

  /**
   * Persists `newFavourites` as the new favourites state: syncs `payload`
   * to the backend service (when login is allowed), then applies the
   * result (or, on failure/when login isn't allowed, `newFavourites`
   * itself) as the current favourites.
   *
   * `payload` is usually the same array as `newFavourites` - the whole,
   * locally computed favourites array. savePersonalizationPreferences()
   * is the exception: it only needs to send the single changed favourite
   * (fav-service's merge endpoint treats 'personalization' as a singleton
   * favourite matched by type alone), so it passes a smaller `payload`
   * while still keeping `newFavourites` as the full local state.
   *
   * @param {*} newFavourites the full, locally computed favourites array
   * @param {*} payload the array actually sent to the backend service
   * @param {*} onFail callback invoked if storing to the backend service fails
   * @param {*} responseType optional favourite 'type' to request back from
   *   the backend service (see fav-service's filterFavourites): when given,
   *   the backend only returns favourites of that type instead of the
   *   whole favourites array (much smaller response), and the result is
   *   merged into `newFavourites` (replacing any existing favourites of
   *   that type) instead of replacing the whole local state with the
   *   (now partial) response. Only use this for singleton favourite types
   *   (currently just 'personalization'), where the caller can guarantee
   *   no other favourite of that type - or of any other type - was
   *   affected by this update.
   */
  persistFavourites(newFavourites, payload, onFail, responseType) {
    this.fetchingOrUpdating();
    if (this.config.allowLogin) {
      updateFavourites(payload, responseType)
        .then(res => {
          if (responseType) {
            const kept = mapToStore(newFavourites).filter(
              favourite => favourite.type !== responseType,
            );
            this.set([...kept, ...res]);
          } else {
            this.set(res);
          }
        })
        .catch(() => {
          onFail();
          if (this.config.allowFavouritesFromLocalstorage) {
            this.set(newFavourites);
            setFavouriteStorage(newFavourites);
          }
          this.fetchComplete();
        });
    } else {
      this.set(newFavourites);
      setFavouriteStorage(newFavourites);
    }
  }

  /**
   * Saves (or updates) the 'personalization' favourite's preferences.
   * Merges the given preferences into any existing 'personalization'
   * favourite (and reuses its favouriteId, if one exists), so that saving
   * never creates a duplicate and unrelated preferences aren't lost.
   *
   * Unlike saveFavourite()/updateFavourites(), this does NOT resend or
   * read back the whole favourites array: only the single changed
   * favourite is sent, and only favourites of type 'personalization' are
   * requested back in the response (see persistFavourites() above). This
   * keeps personalization saves (which can happen frequently, e.g. once
   * per itinerary feedback) cheap in both directions, regardless of how
   * many other favourites the user has.
   *
   * @param {*} preferences preferences object to merge in, e.g. { weights: {...} }
   * @param {*} onFail callback invoked if storing the favourite fails
   */
  savePersonalizationPreferences(preferences, onFail) {
    const existing = find(
      this.favourites,
      favourite => favourite.type === 'personalization',
    );
    const favourite = {
      ...existing,
      type: 'personalization',
      ...preferences,
      lastUpdated: unixTime(),
      favouriteId: existing?.favouriteId || uuid(),
    };
    const newFavourites = mapToStore(this.favourites);
    const editIndex = findIndex(
      newFavourites,
      item => item.favouriteId === favourite.favouriteId,
    );
    if (editIndex >= 0) {
      newFavourites[editIndex] = favourite;
    } else {
      newFavourites.push(favourite);
    }
    this.persistFavourites(
      newFavourites,
      [favourite],
      onFail,
      'personalization',
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
   * Calls onFail when storing favourite fails.
   * Generates or updates lastUpdated epoch and for new favourites,
   * it also generates favouriteId.
   *
   * @param {*} data object containing favourite data
   * @param {*} onFail callback invoked if storing the favourite fails
   */
  saveFavourite(data, onFail) {
    let favourite = { ...data };
    if (typeof favourite !== 'object') {
      onFail();
      throw new Error(
        `New favourite is not a object:${JSON.stringify(favourite)}`,
      );
    }
    if (favourite.type === 'bikeStation') {
      favourite = mapVehicleRentalToStore(favourite);
    }
    const newFavourites = mapToStore(this.favourites);
    const editIndex = findIndex(
      newFavourites,
      item => favourite.favouriteId === item.favouriteId,
    );
    if (editIndex >= 0) {
      newFavourites[editIndex] = {
        ...favourite,
        lastUpdated: unixTime(),
      };
    } else {
      newFavourites.push({
        ...favourite,
        lastUpdated: unixTime(),
        favouriteId: uuid(),
      });
    }
    this.persistFavourites(newFavourites, newFavourites, onFail);
  }

  /**
   * Replaces existing array of favourites with an updated array of favourites.
   *
   * @param {*} newFavourites array of new favourites
   * @param {*} onFail callback invoked if updating the favourites fails
   */
  updateFavourites(newFavourites, onFail) {
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
            setFavouriteStorage(mapped);
          }
          this.fetchComplete();
        });
    } else {
      this.set(mapped);
      setFavouriteStorage(mapped);
    }
  }

  /**
   * Deletes given favourite if one exists in store.
   *
   * @param {*} data object of the favourite to be deleted
   * @param {*} onFail callback invoked if deleting the favourite fails
   */
  deleteFavourite(data, onFail) {
    if (typeof data !== 'object') {
      onFail();
      throw new Error(`Favourite is not an object:${JSON.stringify(data)}`);
    }
    this.fetchingOrUpdating();
    const newFavourites = mapToStore(this.favourites).filter(
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
            setFavouriteStorage(newFavourites);
          }
          this.fetchComplete();
        });
    } else {
      this.set(newFavourites);
      setFavouriteStorage(newFavourites);
    }
  }
}

const favouriteStore = new FavouriteData();

export default favouriteStore;
