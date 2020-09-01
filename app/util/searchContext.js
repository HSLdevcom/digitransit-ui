/**
 *  Function template required for searchUtils earch. One can use DTSearchQueryutils and storeUtils for
 * default implementation, or provide their own.
 */
const searchContext = {
  // Optional, used by default to get store for positions, favouriteLocations, StoreFavouriteRoutes, FavouriteStops, language.
  context: null,
  positionStore: null,
  startLocationWatch: null,
  saveSearch: null,
  saveFutureRoute: null,
  isPeliasLocationAware: false,
  minimalRegexp: null,
  lineRegexp: null,
  feedIDs: [],
  URL_PELIAS: '',
  geocodingSearchParams: null,
  geocodingSources: '',
  getRoutesQuery() {
    return Promise.resolve([]);
  },
  getStopAndStationsQuery() {
    return Promise.resolve([]);
  },
  getFavouriteRoutesQuery() {
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
  getOldSearches: () => [],
  getFavouriteStops: () => [],
  getFavouriterRoutes: () => [],
  getLanguage: () => 'en',
  getFutureRoutes: () => [],
};

export default searchContext;
