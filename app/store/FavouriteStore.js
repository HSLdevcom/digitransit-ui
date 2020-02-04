import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import find from 'lodash/find';
import moment from 'moment';
import {
  getFavouriteStorage,
  setFavouriteStorage,
  getFavouriteRoutesStorage,
  getFavouriteStopsStorage,
  getFavouriteLocationsStorage,
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
      favourite => favourite.gtfsId || favourite.id,
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
    return find(
      this.favourites.filter(favourite => favourite.gtfsId),
      favourite => gtfsId === favourite.gtfsId,
    );
  }

  getById(id) {
    return find(
      this.favourites.filter(favourite => !favourite.gtfsId),
      favourite => id === favourite.id,
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
    if (data.gtfsId && this.getByGtfsId(data.gtfsId)) {
      newFavourites = newFavourites.map(currentFavourite => {
        if (currentFavourite.gtfsId === data.gtfsId) {
          return { ...data, lastUpdated: moment().unix() };
        }
        return currentFavourite;
      });
    } else if (data.id && this.getById(data.id)) {
      newFavourites = newFavourites.map(currentFavourite => {
        if (currentFavourite.id === data.id) {
          return { ...data, lastUpdated: moment().unix() };
        }
        return currentFavourite;
      });
    } else {
      newFavourites.push({ ...data, lastUpdated: moment().unix() });
    }
    this.favourites = newFavourites;
    this.storeFavourites();
    this.emitChange();
  }

  deleteFavourite(data) {
    this.favourites = this.favourites.filter(
      favourite => favourite.gtfsId !== data.gtfsId || favourite.id !== data.id,
    );
    this.storeFavourites();
    this.emitChange();
  }

  migrateRoutes() {
    const routes = getFavouriteRoutesStorage();
    routes.forEach(route => {
      this.addFavourite({ type: 'route', gtfsId: route });
    });
  }

  migrateStops() {
    const stops = getFavouriteStopsStorage();
    stops.forEach(stop => {
      const newStop = {
        type: isStop(stop) ? 'stop' : 'station',
        locationName: stop.locationName,
        gtfsId: stop.gtfsId,
        address: stop.address,
        lon: stop.lon,
        lat: stop.lat,
        layer: stop.layer,
        selectedIconId: stop.selectedIconId,
      };
      this.addFavourite(newStop);
    });
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
            locationName: location.locationName,
            lon: data.geometry.coordinates[0],
            lat: data.geometry.coordinates[1],
            layer: data.properties.layer,
            selectedIconId: location.selectedIconId,
          };
          this.addFavourite(newLocation);
        }
      });
    });
  }

  static handlers = {
    AddFavourite: 'addFavourite',
    DeleteFavourite: 'deleteFavourite',
  };
}
