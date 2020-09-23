import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import find from 'lodash/find';
import moment from 'moment';
import { uuid } from 'uuidv4';
import {
  getFavouriteStorage,
  setFavouriteStorage,
  getFavouriteRoutesStorage,
  getFavouriteStopsStorage,
  getFavouriteLocationsStorage,
  removeItem,
} from './localStorage';
import { isStop } from '../util/suggestionUtils';
import { getGeocodingResult } from '../util/searchUtils';

export default class FavouriteStore extends Store {
  static storeName = 'FavouriteStore';

  favourites = getFavouriteStorage();

  config = {};

  constructor(dispatcher) {
    super(dispatcher);
    this.config = dispatcher.getContext().config;
    this.migrateRoutes();
    this.migrateStops();
    this.migrateLocations();
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
      .filter(
        favourite =>
          favourite.type === 'route' &&
          favourite.gtfsId &&
          favourite.gtfsId.includes(':'),
      )
      .map(favourite => favourite.gtfsId);
  }

  getStopsAndStations() {
    return this.favourites.filter(
      favourite =>
        favourite.gtfsId &&
        favourite.gtfsId.includes(':') &&
        (favourite.type === 'stop' || favourite.type === 'station'),
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
    this.favourites = newFavourites;
    this.storeFavourites();
    this.emitChange();
  }

  deleteFavourite(data) {
    const newFavourites = this.favourites.filter(
      favourite => favourite.favouriteId !== data.favouriteId,
    );
    this.favourites = newFavourites;
    this.storeFavourites();
    this.emitChange();
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
      getGeocodingResult(
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
    DeleteFavourite: 'deleteFavourite',
  };
}
