import PositionStore from '../store/PositionStore';

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

export const getFavouriteBikeRentalStations = context => {
  return context.getStore('FavouriteStore').getBikeRentalStations();
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

export const getFutureRoutes = context => {
  return context.getStore('FutureRouteStore').getFutureRoutes();
};

export const clearFutureRoutes = context => {
  return context.getStore('FutureRouteStore').clearFutureRoutes();
};

export const getOldSearchItems = context => {
  return context.getStore('OldSearchesStore').getOldSearchItems();
};
