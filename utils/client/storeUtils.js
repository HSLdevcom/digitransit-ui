import { addFutureRoute } from '@digitransit-store/digitransit-store-future-route';
import isEqual from 'lodash/isEqual';
import {
  clearOldSearches as clearOldSearchHistory,
  getOldSearches as readOldSearches,
  getOldSearchItems as readOldSearchItems,
} from '../../app/data/SearchHistory';
import { getFutureRoutesStorage, setFutureRoutesStorage } from './localStorage';

export const getPositions = context => {
  return context.getStore('PositionStore').getLocationState();
};

// context is unused here but kept in the signature: it's part of the
// external contract consumed by
// @digitransit-search-util/digitransit-search-util-execute-search-immediate,
// which calls getOldSearches(context, type).
export const getOldSearches = (context, type) => {
  return readOldSearches(type);
};

export const clearOldSearches = () => {
  return clearOldSearchHistory();
};

export const getLanguage = context => {
  return context.config.language;
};

export const getFutureRoutes = () => {
  return getFutureRoutesStorage();
};

export const saveFutureRoute = itinSearch => {
  const previousStorage = getFutureRoutesStorage();
  const storage = addFutureRoute(itinSearch, previousStorage);
  if (!isEqual(storage, previousStorage)) {
    setFutureRoutesStorage(storage);
  }
};

export const clearFutureRoutes = () => {
  setFutureRoutesStorage([]);
};

export const getOldSearchItems = () => {
  return readOldSearchItems();
};
