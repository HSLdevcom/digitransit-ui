import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import {
  setFavouriteRoutesStorage,
  getFavouriteRoutesStorage,
} from './localStorage';

class FavouriteRoutesStore extends Store {
  static storeName = 'FavouriteRoutesStore';

  routes = getFavouriteRoutesStorage();

  isFavourite(id) {
    return includes(this.routes, id);
  }

  storeRoutes() {
    setFavouriteRoutesStorage(this.routes);
  }

  // eslint-disable-next-line class-methods-use-this
  getRoutes() {
    return this.routes.filter(
      route => typeof route === 'string' && route.includes(':'),
    );
  }

  addFavouriteRoute(routeId) {
    if (typeof routeId !== 'string') {
      throw new Error(`routeId is not a string:${JSON.stringify(routeId)}`);
    }

    const newRoutes = this.routes.filter(id => id !== routeId);

    if (newRoutes.length === this.routes.length) {
      newRoutes.push(routeId);
    }

    this.routes = newRoutes;
    this.storeRoutes();
    this.emitChange(routeId);
  }

  static handlers = {
    AddFavouriteRoute: 'addFavouriteRoute',
  };
}

export default FavouriteRoutesStore;
