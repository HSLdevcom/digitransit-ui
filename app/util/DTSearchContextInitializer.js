/* eslint-disable no-param-reassign */
import {
  getRoutesQuery,
  getStopAndStationsQuery,
  getFavouriteRoutesQuery,
  filterStopsByMode,
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
} from './storeUtils';
import { startLocationWatch } from '../action/PositionActions';
import { saveSearch } from '../action/SearchActions';
import { saveFutureRoute } from '../action/FutureRoutesActions';

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
  // FeedId's like  [HSL, HSLLautta]
  searchContext.feedIDs = config.feedIds;
  // searchSources e.g. [oa,osm,nlsfi.]
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
  searchContext.filterStopsByMode = filterStopsByMode;
  searchContext.startLocationWatch = startLocationWatch;
  searchContext.saveSearch = saveSearch;
  searchContext.clearOldSearches = clearOldSearches;
  searchContext.getFutureRoutes = getFutureRoutes;
  searchContext.saveFutureRoute = saveFutureRoute;
  searchContext.clearFutureRoutes = clearFutureRoutes;
}
