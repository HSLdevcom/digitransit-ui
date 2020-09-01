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
    }
    return storage;
  }

  saveFutureRoute(newRoute) {
    saveFutureRoutesStorage(newRoute);
    this.emitChange();
  }

  static handlers = {
    saveFutureRoute: 'saveFutureRoute',
  };
}

export default FutureRoutesStore;
