import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import moment from 'moment';
import { v4 as uuid } from 'uuid';
import getGeocodingResults from '@digitransit-search-util/digitransit-search-util-get-geocoding-results';
import { isStop } from '@digitransit-search-util/digitransit-search-util-helpers';
import {
  clearFavouriteStorage,
  getFavouriteStorage,
  setFavouriteStorage,
  getFavouriteRoutesStorage,
  getFavouriteStopsStorage,
  getFavouriteLocationsStorage,
  removeItem,
} from './localStorage';
import {
  getFavourites,
  updateFavourites,
  deleteFavourites,
} from '../util/apiUtils';

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
    this.fetchingOrUpdating();
    if (this.config.allowLogin) {
      getFavourites()
        .then(res => {
          this.favourites = res;
          this.fetchComplete();
        })
        .catch(() => {
          this.fetchFailed();
        });
    } else {
      this.favourites = getFavouriteStorage();
      this.fetchComplete();
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

  getStatus() {
    return this.status;
  }

  isFavourite(id, type) {
    const ids = this.favourites
      .filter(favourite => favourite.type === type)
      .map(favourite => favourite.gtfsId || favourite.gid);
    return includes(ids, id);
  }

  isFavouriteBikeRentalStation(id, networks) {
    const ids = this.favourites
      .filter(
        favourite =>
          favourite.type === 'bikeStation' &&
          isEqual(sortBy(favourite.networks), sortBy(networks)),
      )
      .map(favourite => favourite.stationId);
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
    return this.favourites;
  }

  getByGtfsId(gtfsId, type) {
    return find(
      this.favourites,
      favourite => gtfsId === favourite.gtfsId && type === favourite.type,
    );
  }

  getByFavouriteId(favouriteId) {
    return find(
      this.favourites,
      favourite => favouriteId === favourite.favouriteId,
    );
  }

  getByStationIdAndNetworks(stationId, networks) {
    return find(
      this.favourites,
      favourite =>
        stationId === favourite.stationId &&
        isEqual(sortBy(favourite.networks), sortBy(networks)),
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

  getBikeRentalStations() {
    return this.favourites.filter(
      favourite => favourite.type === 'bikeStation',
    );
  }

  saveFavourite(data) {
    if (typeof data !== 'object') {
      throw new Error(`New favourite is not a object:${JSON.stringify(data)}`);
    }
    this.fetchingOrUpdating();
    const newFavourites = this.favourites;
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
        .then(() => {
          this.favourites = newFavourites;
          this.fetchComplete();
        })
        .catch(() => {
          this.favourites = newFavourites;
          this.fetchComplete();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.fetchComplete();
    }
  }

  updateFavourites(newFavourites) {
    if (!Array.isArray(newFavourites)) {
      throw new Error(
        `New favourites is not an array:${JSON.stringify(newFavourites)}`,
      );
    }
    this.fetchingOrUpdating();
    if (this.config.allowLogin) {
      // Update favourites to backend service
      updateFavourites(newFavourites)
        .then(() => {
          this.favourites = newFavourites;
          this.fetchComplete();
        })
        .catch(() => {
          this.favourites = newFavourites;
          this.fetchComplete();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.fetchComplete();
    }
  }

  deleteFavourite(data) {
    if (typeof data !== 'object') {
      throw new Error(`Favourite is not an object:${JSON.stringify(data)}`);
    }
    this.fetchingOrUpdating();
    const newFavourites = this.favourites.filter(
      favourite => favourite.favouriteId !== data.favouriteId,
    );
    if (this.config.allowLogin) {
      // Delete favourite from backend service
      deleteFavourites([data.favouriteId])
        .then(() => {
          this.favourites = newFavourites;
          this.fetchComplete();
        })
        .catch(() => {
          this.favourites = newFavourites;
          this.fetchComplete();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.fetchComplete();
    }
  }

  migrateRoutes() {
    const routes = getFavouriteRoutesStorage();
    routes.forEach(route => {
      this.saveFavourite({ type: 'route', gtfsId: route });
    });
    removeItem('favouriteRoutes');
  }

  migrateStops() {
    const stops = getFavouriteStopsStorage();
    stops.forEach(stop => {
      const newStop = {
        type: isStop(stop) ? 'stop' : 'station',
        name: stop.locationName,
        gtfsId: stop.gtfsId,
        address: stop.address,
        lon: stop.lon,
        lat: stop.lat,
        layer: stop.layer,
        selectedIconId: stop.selectedIconId,
      };
      this.saveFavourite(newStop);
    });
    removeItem('favouriteStops');
  }

  migrateLocations() {
    const locations = getFavouriteLocationsStorage();
    locations.forEach(location => {
      getGeocodingResults(
        location.address,
        this.config.searchParams,
        null,
        null,
        null,
        this.config,
      ).then(res => {
        const data = find(
          res,
          elem =>
            elem.properties.label === location.address ||
            (location.lon === elem.geometry.coordinates[0] &&
              location.lat === elem.geometry.coordinates[1]),
        );
        if (data) {
          const newLocation = {
            type: 'place',
            id: data.properties.gid,
            address: data.properties.label,
            name: location.locationName,
            lon: data.geometry.coordinates[0],
            lat: data.geometry.coordinates[1],
            layer: data.properties.layer,
            selectedIconId: location.selectedIconId,
          };
          this.saveFavourite(newLocation);
        }
      });
    });
    removeItem('favouriteLocations');
  }

  static handlers = {
    SaveFavourite: 'saveFavourite',
    UpdateFavourites: 'updateFavourites',
    DeleteFavourite: 'deleteFavourite',
  };
}
