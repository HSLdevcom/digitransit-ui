/* eslint class-methods-use-this: ["error", { "exceptMethods": ["saveStorage", "createUrl"] }] */
/* eslint-disable no-useless-constructor */
import Store from 'fluxible/addons/BaseStore';
import { addFutureRoute } from '@digitransit-store/digitransit-store-future-route';
import { getFutureRoutesStorage, setFutureRoutesStorage } from './localStorage';
import { PREFIX_ITINERARY_SUMMARY } from '../util/path';

class FutureRouteStore extends Store {
  static storeName = 'FutureRouteStore';

  emptyData = JSON.parse('[]');

  constructor() {
    super();
  }

  getFutureRoutes() {
    const storage = getFutureRoutesStorage();
    if (!storage) {
      setFutureRoutesStorage(this.emptyData);
      this.emitChange();
    }
    return storage;
  }

  saveFutureRoute(route) {
    const storage = addFutureRoute(route, this.getFutureRoutes(), {
      itinerarySummaryPrefix: PREFIX_ITINERARY_SUMMARY,
    });
    setFutureRoutesStorage(storage);
    this.emitChange();
  }

  clearFutureRoutes() {
    setFutureRoutesStorage(this.emptyData);
    this.emitChange();
  }

  static handlers = {
    saveFutureRoute: 'saveFutureRoute',
  };
}

export default FutureRouteStore;
