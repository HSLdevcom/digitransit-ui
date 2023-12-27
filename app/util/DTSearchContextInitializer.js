/* eslint-disable no-param-reassign */
import {
  getRoutesQuery,
  getStopAndStationsQuery,
  getFavouriteRoutesQuery,
  getFavouriteVehicleRentalStationsQuery,
  // getAllVehicleRentalStations,  // Bike stations are fetched from Geocoding
} from '@digitransit-search-util/digitransit-search-util-query-utils';
import {
  getPositions,
  getFavouriteLocations,
  getFavouriteRoutes,
  getOldSearches,
  getFavouriteStops,
  getLanguage,
  clearOldSearches,
  getFutureRoutes,
  clearFutureRoutes,
  getFavouriteVehicleRentalStations,
} from './storeUtils';
import { startLocationWatch } from '../action/PositionActions';
import { saveSearch } from '../action/SearchActions';
import { saveFutureRoute } from '../action/FutureRoutesActions';
import { useCitybikes } from './modeUtils';
import { getDefaultNetworks } from './vehicleRentalUtils';

export default function intializeSearchContext(context, searchContext) {
  // DT-3424: Set SearchContext for Autosuggest and searchUtils.
  searchContext.context = context;
  const { config } = context;
  searchContext.isPeliasLocationAware = config.autoSuggest.locationAware;
  searchContext.minimalRegexp = config.search
    ? config.search.minimalRegexp
    : undefined;
  searchContext.lineRegexp = config.search
    ? config.search.lineRegexp
    : undefined;
  searchContext.URL_PELIAS = config.URL.PELIAS;
  searchContext.URL_PELIAS_PLACE = config.URL.PELIAS_PLACE;
  // FeedId's like  [HSL, HSLLautta]
  searchContext.feedIDs = config.feedIds;
  searchContext.cityBikeNetworks = useCitybikes(
    config.cityBike.networks,
    config,
  )
    ? getDefaultNetworks(config).map(t => `citybikes${t}`)
    : [];
  // searchSources e.g. [oa,osm,nlsfi.]
  searchContext.parkingAreaSources = config.parkingAreaSources
    ? config.parkingAreaSources.map(s => `parks${s}`)
    : undefined;
  searchContext.geocodingSources = config.searchSources;
  searchContext.geocodingSearchParams = config.searchParams;
  searchContext.getOldSearches = getOldSearches;
  searchContext.getFavouriteLocations = getFavouriteLocations;
  searchContext.getFavouriteStops = getFavouriteStops;
  searchContext.getLanguage = getLanguage;
  searchContext.getFavouriteRoutes = getFavouriteRoutes;
  searchContext.getPositions = getPositions;
  searchContext.getRoutesQuery = getRoutesQuery;
  searchContext.getStopAndStationsQuery = getStopAndStationsQuery;
  searchContext.getFavouriteRoutesQuery = getFavouriteRoutesQuery;
  searchContext.getFavouriteVehicleRentalStations = getFavouriteVehicleRentalStations;
  searchContext.getFavouriteVehicleRentalStationsQuery = getFavouriteVehicleRentalStationsQuery;
  searchContext.startLocationWatch = startLocationWatch;
  searchContext.saveSearch = saveSearch;
  searchContext.clearOldSearches = clearOldSearches;
  searchContext.getFutureRoutes = getFutureRoutes;
  searchContext.saveFutureRoute = saveFutureRoute;
  searchContext.clearFutureRoutes = clearFutureRoutes;
}
