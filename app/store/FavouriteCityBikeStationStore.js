import Store from 'fluxible/addons/BaseStore';
import {
  getFavouriteCityBikeStations,
  setFavouriteCityBikeStations,
} from './localStorage';

class FavouriteCityBikeStationStore extends Store {
  static storeName = 'FavouriteCityBikeStationStore';

  // eslint-disable-next-line class-methods-use-this
  isFavourite(id) {
    return getFavouriteCityBikeStations().includes(id);
  }

  addFavouriteCityBikeStation(id) {
    const favourites = getFavouriteCityBikeStations();
    if (!favourites.includes(id)) {
      favourites.push(id);
      setFavouriteCityBikeStations(favourites);
      this.emitChange();
    }
  }

  removeFavouriteCityBikeStation(id) {
    const favourites = getFavouriteCityBikeStations();
    const newFavourites = favourites.filter(fav => fav !== id);

    if (newFavourites.length !== favourites.length) {
      setFavouriteCityBikeStations(newFavourites);
      this.emitChange();
    }
  }

  toggleFavouriteCityBikeStation(id) {
    if (this.isFavourite(id)) {
      this.removeFavouriteCityBikeStation(id);
    } else {
      this.addFavouriteCityBikeStation(id);
    }
  }

  static handlers = {
    ToggleFavouriteCityBikeStation: 'toggleFavouriteCityBikeStation',
  };
}

export default FavouriteCityBikeStationStore;
