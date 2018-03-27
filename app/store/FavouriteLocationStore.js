import Store from 'fluxible/addons/BaseStore';
import maxBy from 'lodash/maxBy';
import find from 'lodash/find';
import {
  getFavouriteLocationsStorage,
  setFavouriteLocationsStorage,
} from './localStorage';

class FavouriteLocationStore extends Store {
  static storeName = 'FavouriteLocationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.locations = this.getLocations();
    this.migrate();
  }

  getByNumber = number =>
    find(this.locations, location => number === location.number);

  /*
   * migrate local storage data from old format to new.
  *  v1 adds
   *  {
   *    version: 1  // data version so we can migrate later too
   *    number:     // identifier (for updates)
   *  }
   */
  migrate = () => {
    this.migrateAndSave(this.migrate01(this.locations));
  };

  migrateAndSave = migrationResult => {
    if (migrationResult !== null) {
      this.locations = migrationResult;
      this.save();
    }
  };

  getMaxNumber = collection =>
    (maxBy(collection, location => location.number) || { number: 0 }).number;

  migrate01 = locations => {
    const matchF = favourite => favourite.version === undefined;
    if (locations.filter(matchF).length === 0) {
      return null;
    } // nothing to migrate

    let maxNumber = this.getMaxNumber(locations);

    const modified = locations.map(favourite => {
      maxNumber += 1;
      if (matchF(favourite)) {
        const migrated = { ...favourite, version: 1, number: maxNumber };
        return migrated;
      }
      return { favourite };
    });
    return modified;
  };

  save = () => {
    setFavouriteLocationsStorage(this.locations);
  };

  // eslint-disable-next-line class-methods-use-this
  getLocations() {
    return getFavouriteLocationsStorage();
  }

  addFavouriteLocation(location) {
    if (typeof location !== 'object') {
      throw new Error(`location is not a object:${JSON.stringify(location)}`);
    }

    if (location.number === undefined) {
      // new
      this.locations.push({
        ...location,
        number: 1 + this.getMaxNumber(this.locations),
      });
    } else {
      // update
      this.locations = this.locations.map(currentLocation => {
        if (currentLocation.number === location.number) {
          return location;
        }
        return currentLocation;
      });
    }
    this.save();
    this.emitChange();
  }

  deleteFavouriteLocation(location) {
    this.locations = this.locations.filter(
      currentLocation => currentLocation.number !== location.number,
    );
    this.save();
    this.emitChange();
  }

  static handlers = {
    AddFavouriteLocation: 'addFavouriteLocation',
    DeleteFavouriteLocation: 'deleteFavouriteLocation',
  };
}

export default FavouriteLocationStore;
