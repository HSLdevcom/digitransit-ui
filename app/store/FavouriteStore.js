import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import {
    getFavouriteStorage,
    setFavouriteStorage,
    getFavouriteRoutesStorage,
  } from './localStorage';

export default class FavouriteStore extends Store {
    static storeName = 'FavouriteStore';

    favourites = getFavouriteStorage();

    isFavouriteRoute(route) {
        const routes = this.favourites.filter(fav => fav.type === 'route').map(fav => fav.gtfsId);
        return includes(routes, route);
    }

    storeFavourites() {
        setFavouriteStorage(this.favourites);
    }

    // eslint-disable-next-line class-methods-use-this
    getRoutes() {
      return this.favourites.filter(
        favourite =>  favourite.type === 'route' && favourite.gtfsId.includes(':'),
      );
    }

    addFavourite(data) {
        const newFavourites = this.favourites.filter(favourite => favourite.gtfsId !== data.gtfsId || favourite.id !== data.id);
        if (newFavourites.length === this.favourites.length) {
            newFavourites.push(data);
        }
        this.favourites = newFavourites;
        this.storeFavourites();
        this.emitChange(data.gtfsId);
    }

    static handlers = {
        AddFavourite: 'addFavourite',
    }
}