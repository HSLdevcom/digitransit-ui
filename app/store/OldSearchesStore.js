import Store from 'fluxible/addons/BaseStore';
import orderBy from 'lodash/orderBy';
import { getOldSearchesStorage, setOldSearchesStorage } from './localStorage';

class OldSearchesStore extends Store {
  static storeName = 'OldSearchesStore';

  constructor(dispatcher) {
    super(dispatcher);

    // migrate old searches
    setOldSearchesStorage(this.getOldSearches().map((item) => {
      item.type = item.type || 'endpoint'; // eslint-disable-line no-param-reassign
      return item;
    }));
  }

  // storage (sorted by count desc):
  // [
  //  {
  //   "address": "Espoo, Espoo",
  //   "coordinates" :[]
  //   "count": 1
  //   "type": "endpoint" or "search"
  //  }
  // ]
  saveSearch(destination) {
    let searches = this.getOldSearches();

    const found =
      searches
        .filter(storedSearch => storedSearch.type === destination.type)
        .filter(storedSearch => storedSearch.address === destination.address);

    switch (found.length) {
      case 0:
        searches.push(Object.assign({
          count: 1,
        }, destination));

        break;
      case 1:
        found[0].count += 1;
        break;
      default:
        console.error('too many matches', found);
    }

    setOldSearchesStorage(orderBy(searches, 'count', 'desc'));
    searches = this.getOldSearches();
    this.emitChange(destination);
  }

  // eslint-disable-next-line class-methods-use-this
  getOldSearches(type) {
    return getOldSearchesStorage().filter(item => (type ? item.type === type : true));
  }

  static handlers = {
    SaveSearch: 'saveSearch',
  };
}

export default OldSearchesStore;
