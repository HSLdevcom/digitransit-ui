import Store from 'fluxible/addons/BaseStore';
import maxBy from 'lodash/maxBy';
import find from 'lodash/find';
import { getFavouriteLocationsStorage, setFavouriteLocationsStorage } from './localStorage';

class FavouriteLocationStore extends Store {
  static storeName = 'FavouriteLocationStore';

  constructor(dispatcher) {
    super(dispatcher);
    this.locations = this.getLocations();
    this.migrate();
  }

  getById = (id) => find(this.locations, (location) => id === location.id);

  /*
   * migrate local storage data from old format to new.
  *  v1 adds
   *  {
   *    version: 1  // data version so we can migrate later too
   *    id:         // identifier (for updates)
   *  }
   */
  migrate = () => {
    this.migrateAndSave(this.migrate01(this.locations));
  }

  migrateAndSave = (migrationResult) => {
    if (migrationResult !== null) {
      this.locations = migrationResult;
      this.save();
    }
  }

  migrate01 = (locations) => {
    const matchF = favourite => favourite.version === undefined;
    if (locations.filter(matchF).length === 0) return null; // nothing to migrate

    let maxId = maxBy(locations, (location) => location.id) || 0;

    const modified = locations.map((favourite) => {
      if (matchF(favourite)) {
        const migrated = { ...favourite, version: 1, id: ++maxId };
        return migrated;
      }
      return { favourite };
    });
    return modified;
  }


  save = () => {
    setFavouriteLocationsStorage(this.locations);
  }

  getLocations() {
    return getFavouriteLocationsStorage();
  }

  addFavouriteLocation(location) {
    if (typeof location !== 'object') {
      throw new Error(`location is not a object:${JSON.stringify(location)}`);
    }

    this.locations.push(location);
    this.save();
  }

  static handlers = {
    AddFavouriteLocation: 'addFavouriteLocation',
  };
}

export default FavouriteLocationStore;
