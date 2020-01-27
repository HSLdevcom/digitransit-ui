import Store from 'fluxible/addons/BaseStore';
import includes from 'lodash/includes';
import find from 'lodash/find';
import {
    getFavouriteStorage,
    setFavouriteStorage,
    getFavouriteRoutesStorage,
  } from './localStorage';
import moment from 'moment';

export default class FavouriteStore extends Store {
    static storeName = 'FavouriteStore';

    favourites = getFavouriteStorage();

    isFavourite(id) {
        const ids = this.favourites.map(favourite => favourite.gtfsId || favourite.id);
        return includes(ids, id);
    }

    storeFavourites() {
        setFavouriteStorage(this.favourites);
    }

    getFavourites() {
        return this.favourites;
    }

    getByGtfsId(gtfsId) {
        return find(this.favourites.filter(fav => fav.gtfsId), favourite => gtfsId === favourite.gtfsId);
    }
    getById(id) {
        return find(this.favourites.filter(fav => !fav.gtfsId), favourite => id === favourite.id);
    }

    getRoutes() {
      return this.favourites.filter(favourite =>  favourite.type === 'route').map(favourite => favourite.gtfsId);
    }

    getStopsAndStations() {
      return this.favourites.filter(favourite =>  favourite.type === 'stop' || favourite.type === 'station');
    }

    getLocations() {
        return this.favourites.filter(favourite =>  favourite.type === 'place');
    }

    addFavourite(data) {
        if (typeof data !== 'object') {
            throw new Error(`New favourite is not a object:${JSON.stringify(data)}`);
        }

        const newFavourites = this.favourites.filter(favourite => favourite.gtfsId !== data.gtfsId || favourite.id !== data.id);
        if (newFavourites.length === this.favourites.length) {
            newFavourites.push({...data, lastUpdated: moment().unix()});
        }
        this.favourites = newFavourites;
        this.storeFavourites();
        this.emitChange();
    }

    deleteFavourite(data) {
        this.favourites = this.favourites.filter(favourite => favourite.gtfsId !== data.gtfsId || favourite.id !== data.id);
        this.storeFavourites();
        this.emitChange();
    }

    static handlers = {
        AddFavourite: 'addFavourite',
        DeleteFavourite: 'deleteFavourite',
    }
}