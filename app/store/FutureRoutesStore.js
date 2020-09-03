import Store from 'fluxible/addons/BaseStore';
import {
  getFutureRoutesStorage,
  saveFutureRoutesStorage,
} from './localStorage';

class FutureRoutesStore extends Store {
  static storeName = 'FutureRoutesStore';

  // eslint-disable-next-line class-methods-use-this
  getFutureRoutes() {
    let storage = getFutureRoutesStorage();
    if (!storage) {
      storage = {
        items: [],
      };
      saveFutureRoutesStorage(storage);
      this.emitChange();
    }
    return storage;
  }

  saveFutureRoute(newRoute) {
    saveFutureRoutesStorage(newRoute);
    this.emitChange();
  }

  clearFutureRoutes() {
    const storage = {
      items: [],
    };
    saveFutureRoutesStorage(storage);
    this.emitChange();
  }

  static handlers = {
    saveFutureRoute: 'saveFutureRoute',
  };
}

export default FutureRoutesStore;
