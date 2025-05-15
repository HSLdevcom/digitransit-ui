/* eslint class-methods-use-this: ["error", { "exceptMethods": ["saveStorage", "createUrl"] }] */
/* eslint-disable no-useless-constructor */
import Store from 'fluxible/addons/BaseStore';
import { addFutureRoute } from '@digitransit-store/digitransit-store-future-route';
import { getFutureRoutesStorage, setFutureRoutesStorage } from './localStorage';

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

  saveFutureRoute(itinSearch) {
    if (itinSearch.time < new Date().getTime() / 1000 + 300) {
      // saved search must be at least 5 minutes in future
      return;
    }
    const storage = addFutureRoute(itinSearch, this.getFutureRoutes());
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
