import { addFutureRoute } from '@digitransit-store/digitransit-store-future-route';
import PositionStore from '../store/PositionStore';
import {
  getFutureRoutesStorage,
  setFutureRoutesStorage,
} from '../store/localStorage';

export const getPositionStore = () => {
  return PositionStore;
};

export const getPositions = context => {
  return context.getStore('PositionStore').getLocationState();
};

export const getFavouriteLocations = context => {
  return context.getStore('FavouriteStore').getLocations();
};

export const getFavouriteRoutes = context => {
  return context.getStore('FavouriteStore').getRouteGtfsIds();
};

export const getFavouriteStops = context => {
  return context.getStore('FavouriteStore').getStopsAndStations();
};

export const getFavouriteVehicleRentalStations = context => {
  return context.getStore('FavouriteStore').getVehicleRentalStations();
};

export const getOldSearches = (context, type) => {
  return context.getStore('OldSearchesStore').getOldSearches(type);
};

export const clearOldSearches = context => {
  return context.getStore('OldSearchesStore').clearOldSearches();
};

export const getLanguage = context => {
  return context.getStore('PreferencesStore').getLanguage();
};

export const getFutureRoutes = () => {
  return getFutureRoutesStorage();
};

export const saveFutureRoute = itinSearch => {
  if (itinSearch.time > new Date().getTime() / 1000 + 300) {
    // saved search must be at least 5 minutes in future
    const storage = addFutureRoute(itinSearch, getFutureRoutesStorage());
    setFutureRoutesStorage(storage);
  }
};

export const clearFutureRoutes = () => {
  setFutureRoutesStorage([]);
};

export const getOldSearchItems = context => {
  return context.getStore('OldSearchesStore').getOldSearchItems();
};
