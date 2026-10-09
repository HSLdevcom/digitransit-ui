import { addFutureRoute } from '@digitransit-store/digitransit-store-future-route';
import isEqual from 'lodash/isEqual';
import { getFutureRoutesStorage, setFutureRoutesStorage } from './localStorage';

export const getPositions = context => {
  return context.getStore('PositionStore').getLocationState();
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
