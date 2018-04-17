import Store from 'fluxible/addons/BaseStore';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';
import moment from 'moment';

import { getOldSearchesStorage, setOldSearchesStorage } from './localStorage';
import { getNameLabel } from '../util/suggestionUtils';

/**
 * The current version number of this store.
 */
export const STORE_VERSION = 2;

/**
 * The maximum amount of time in seconds an item gets stored.
 */
export const STORE_PERIOD = 300;

class OldSearchesStore extends Store {
  static storeName = 'OldSearchesStore';

  constructor(dispatcher) {
    super(dispatcher);

    const oldSearches = getOldSearchesStorage();
    if (
      !oldSearches ||
      oldSearches.version == null ||
      oldSearches.version < STORE_VERSION
    ) {
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: [],
      });
    }
  }

  saveSearch(destination) {
    let searches = getOldSearchesStorage().items;

    const found = find(searches, oldItem =>
      isEqual(
        getNameLabel(destination.item.properties),
        getNameLabel(oldItem.item.properties),
      ),
    );

    const timestamp = moment().unix();
    if (found != null) {
      found.count += 1;
      found.lastUpdated = timestamp;
      found.item = cloneDeep(destination.item);
    } else {
      searches.push({
        count: 1,
        lastUpdated: timestamp,
        ...destination,
      });
    }

    setOldSearchesStorage({
      version: STORE_VERSION,
      items: orderBy(searches, 'count', 'desc'),
    });
    searches = this.getOldSearches();
    this.emitChange(destination);
  }

  // eslint-disable-next-line class-methods-use-this
  getOldSearches(type) {
    const { items } = getOldSearchesStorage();
    const timestamp = moment().unix();
    return items
      .filter(
        item =>
          (type ? item.type === type : true) &&
          (item.lastUpdated
            ? timestamp - item.lastUpdated < STORE_PERIOD
            : true),
      )
      .map(item => item.item);
  }

  static handlers = {
    SaveSearch: 'saveSearch',
  };
}

export default OldSearchesStore;
