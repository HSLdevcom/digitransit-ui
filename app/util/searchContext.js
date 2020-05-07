/**
 *  Function template required for searchUtils earch. One can use DTSearchutils and storeUtils for
 * default implementation, or provide their own.
 */
const searchContext = {
  // Optional, used by default to get store for positions, favouriteLocations, StoreFavouriteRoutes, FavouriteStops, language.
  context: null,
  positionStore: null,
  startLocationWatch: null,
  saveSearch: null,
  getRoutes() {
    return Promise.resolve([]);
  },
  getStopAndStations() {
    return Promise.resolve([]);
  },
  getFavouriteRoutes() {
    return Promise.resolve([]);
  },
  getPositions: () => {
    return {
      lat: 0,
      lon: 0,
      address: undefined,
      status: 'no-location',
      hasLocation: false,
      isLocationingInProgress: false,
      locationingFailed: false,
    };
  },
  getFavouriteLocations: () => [],
  getStoredFavouriteRoutes: () => [],
  getOldSearches: () => [],
  getFavouriteStops: () => [],
  getLanguage: () => 'en',
};

export default searchContext;
