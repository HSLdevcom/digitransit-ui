import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import find from 'lodash/find';
import moment from 'moment';
import { uuid } from 'uuidv4';
import getGeocodingResults from '@digitransit-search-util/digitransit-search-util-get-geocoding-results';
import {
  getFavouriteStorage,
  setFavouriteStorage,
  getFavouriteRoutesStorage,
  getFavouriteStopsStorage,
  getFavouriteLocationsStorage,
  removeItem,
} from './localStorage';
import { isStop } from '../util/suggestionUtils';
import {
  getFavourites,
  updateFavourites,
  deleteFavourites,
} from '../util/apiUtils';

export default class FavouriteStore extends Store {
  static storeName = 'FavouriteStore';

  static STATUS_FETCHING = 'fetching';

  static STATUS_HAS_DATA = 'has-data';

  favourites = [];

  config = {};

  status = null;

  constructor(dispatcher) {
    super(dispatcher);
    this.config = dispatcher.getContext().config;
    this.fetching();
    if (this.config.showLogin) {
      getFavourites()
        .then(res => {
          this.favourites = res;
          this.fetchComplete();
        })
        .catch(() => {
          this.favourites = getFavouriteStorage();
          this.fetchComplete();
        });
    } else {
      this.favourites = getFavouriteStorage();
      this.fetchComplete();
    }
    this.migrateRoutes();
    this.migrateStops();
    this.migrateLocations();
  }

  fetchComplete() {
    this.status = FavouriteStore.STATUS_HAS_DATA;
    this.emitChange();
  }

  fetching() {
    this.status = FavouriteStore.STATUS_FETCH_OR_UPDATE;
    this.emitChange();
  }

  getStatus() {
    return this.status;
  }

  isFavourite(id) {
    const ids = this.favourites.map(
      favourite => favourite.gtfsId || favourite.gid,
    );
    return includes(ids, id);
  }

  storeFavourites() {
    setFavouriteStorage(this.favourites);
  }

  getFavourites() {
    return this.favourites;
  }

  getByGtfsId(gtfsId) {
    return find(this.favourites, favourite => gtfsId === favourite.gtfsId);
  }

  getByFavouriteId(favouriteId) {
    return find(
      this.favourites,
      favourite => favouriteId === favourite.favouriteId,
    );
  }

  getRoutes() {
    return this.favourites
      .filter(favourite => favourite.type === 'route')
      .map(favourite => favourite.gtfsId);
  }

  getStopsAndStations() {
    return this.favourites.filter(
      favourite => favourite.type === 'stop' || favourite.type === 'station',
    );
  }

  getLocations() {
    return this.favourites.filter(favourite => favourite.type === 'place');
  }

  addFavourite(data) {
    if (typeof data !== 'object') {
      throw new Error(`New favourite is not a object:${JSON.stringify(data)}`);
    }
    let newFavourites = this.favourites;
    if (data.favouriteId && this.getByFavouriteId(data.favouriteId)) {
      newFavourites = newFavourites.map(currentFavourite => {
        if (currentFavourite.favouriteId === data.favouriteId) {
          return { ...data, lastUpdated: moment().unix() };
        }
        return currentFavourite;
      });
    } else {
      newFavourites.push({
        ...data,
        lastUpdated: moment().unix(),
        favouriteId: uuid(),
      });
    }
    if (this.config.showLogin) {
      updateFavourites(newFavourites)
        .then(() => {
          this.favourites = newFavourites;
          this.emitChange();
        })
        .catch(() => {
          this.favourites = newFavourites;
          this.storeFavourites();
          this.emitChange();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.emitChange();
    }
  }

  updateFavourites(favourites) {
    const newFavourites = favourites.map(favourite => {
      return {
        ...favourite,
        lastUpdated: moment().unix(),
      };
    });
    if (this.config.showLogin) {
      updateFavourites(newFavourites)
        .then(() => {
          this.favourites = newFavourites;
          this.emitChange();
        })
        .catch(() => {
          this.favourites = newFavourites;
          this.storeFavourites();
          this.emitChange();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.emitChange();
    }
  }

  deleteFavourite(data) {
    const newFavourites = this.favourites.filter(
      favourite => favourite.favouriteId !== data.favouriteId,
    );
    if (this.config.showLogin) {
      deleteFavourites([data.favouriteId])
        .then(() => {
          this.favourites = newFavourites;
          this.emitChange();
        })
        .catch(() => {
          this.favourites = newFavourites;
          this.storeFavourites();
          this.emitChange();
        });
    } else {
      this.favourites = newFavourites;
      this.storeFavourites();
      this.emitChange();
    }
  }

  migrateRoutes() {
    const routes = getFavouriteRoutesStorage();
    routes.forEach(route => {
      this.addFavourite({ type: 'route', gtfsId: route });
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
      this.addFavourite(newStop);
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
          this.addFavourite(newLocation);
        }
      });
    });
    removeItem('favouriteLocations');
  }

  static handlers = {
    AddFavourite: 'addFavourite',
    UpdateFavourites: 'updateFavourites',
    DeleteFavourite: 'deleteFavourite',
  };
}
