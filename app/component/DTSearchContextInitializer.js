/* eslint-disable no-param-reassign */
import {
  getRoutes,
  getStopAndStations,
  getFavouriteRoutes,
} from '../util/DTSearchUtils';
import {
  getPositions,
  getFavouriteLocations,
  getFavouriteRoutes as getStoredFavouriteRoutes,
  getOldSearches,
  getFavouriteStops,
  getLanguage,
} from '../util/storeUtils';

export default function intializeSearchContext(context, searchContext) {
  // DT-3424: Set SearchContext for Autosuggest and searchUtils.
  searchContext.context = context;
  searchContext.getOldSearches = getOldSearches;
  searchContext.getFavouriteLocations = getFavouriteLocations;
  searchContext.getFavouriteStops = getFavouriteStops;
  searchContext.getLanguage = getLanguage;
  searchContext.getStoredFavouriteRoutes = getStoredFavouriteRoutes;
  searchContext.getPositions = getPositions;
  searchContext.getRoutes = getRoutes;
  searchContext.getStopAndStations = getStopAndStations;
  searchContext.getFavouriteRoutes = getFavouriteRoutes;
}
