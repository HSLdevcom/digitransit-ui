import {
  getRoutesQuery,
  getStopAndStationsQuery,
  getFavouriteRoutesQuery,
  getFavouriteVehicleRentalStationsQuery,
  // getAllVehicleRentalStations,  // Bike stations are fetched from Geocoding
} from '@digitransit-search-util/digitransit-search-util-query-utils';
import {
  getPositions,
  getOldSearches,
  getLanguage,
  clearOldSearches,
  getFutureRoutes,
  clearFutureRoutes,
} from '../util/storeUtils';
import favouriteStore, {
  getFavouritePlaces,
  getFavouriteStopsAndStations,
  getFavouriteRouteGtfsIds,
  getFavouriteVehicleRentalStations,
} from './FavouriteData';
import { startLocationWatch } from '../action/PositionActions';
import { saveSearch } from '../action/SearchActions';
import { useCitybikes } from '../util/modeUtils';
import { getDefaultNetworks } from '../util/vehicleRentalUtils';

/**
 * Plain (non-Flux) singleton that acts both as the template/interface for,
 * and the concrete Digitransit implementation of, the "search context"
 * consumed by the framework-agnostic @digitransit-search-util packages
 * (most notably digitransit-search-util-execute-search-immidiate). Those
 * packages only rely on the shape of this object (fields/methods read off
 * it, all set up in init() below), so init() doubles as living
 * documentation of that contract.
 *
 * init() is called once, synchronously, during app bootstrap in client.js
 * (mirroring favouriteStore.init(config)), strictly before anything renders.
 * Consequently no component ever observes this singleton in an
 * uninitialized state, so unlike FavouriteData it doesn't need to expose
 * safe no-op defaults for its fields/methods.
 */
class SearchContext {
  initialized = false;

  /**
   * Initializes the singleton with the real Digitransit implementations,
   * derived from the fluxible context/config. Safe to call more than once;
   * only the first call has an effect.
   */
  init(context) {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.context = context;
    const { config } = context;
    this.isPeliasLocationAware = config.autoSuggest.locationAware;
    this.minimalRegexp = config.search
      ? config.search.minimalRegexp
      : undefined;
    this.lineRegexp = config.search ? config.search.lineRegexp : undefined;
    this.showStopStatusMarkers = !!config.showStopStatusMarkers;
    this.URL_PELIAS = config.URL.PELIAS;
    this.URL_PELIAS_PLACE = config.URL.PELIAS_PLACE;
    // FeedId's like  [HSL, HSLLautta]
    this.feedIDs = config.feedIds;
    this.cityBikeNetworks = useCitybikes(config.vehicleRental.networks, config)
      ? getDefaultNetworks(config).map(t => `citybikes${t}`)
      : [];
    // searchSources e.g. [oa,osm,nlsfi.]
    this.parkingAreaSources = config.parkingAreaSources
      ? config.parkingAreaSources.map(s => `parks${s}`)
      : undefined;
    this.geocodingSources = config.searchSources;
    this.geocodingSearchParams = config.searchParams;
    this.getOldSearches = getOldSearches;
    this.getFavouriteLocations = () =>
      getFavouritePlaces(favouriteStore.getFavourites());
    this.getFavouriteStops = () =>
      getFavouriteStopsAndStations(favouriteStore.getFavourites());
    this.getLanguage = getLanguage;
    this.getFavouriteRoutes = () =>
      getFavouriteRouteGtfsIds(favouriteStore.getFavourites());
    this.getPositions = getPositions;
    this.getRoutesQuery = getRoutesQuery;
    this.getStopAndStationsQuery = getStopAndStationsQuery;
    this.getFavouriteRoutesQuery = getFavouriteRoutesQuery;
    this.getFavouriteVehicleRentalStations = () =>
      getFavouriteVehicleRentalStations(favouriteStore.getFavourites());
    this.getFavouriteVehicleRentalStationsQuery =
      getFavouriteVehicleRentalStationsQuery;
    this.startLocationWatch = startLocationWatch;
    this.saveSearch = saveSearch;
    this.clearOldSearches = clearOldSearches;
    this.getFutureRoutes = getFutureRoutes;
    this.clearFutureRoutes = clearFutureRoutes;
  }
}

const searchContext = new SearchContext();

export default searchContext;
