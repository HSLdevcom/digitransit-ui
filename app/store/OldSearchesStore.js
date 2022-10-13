import Store from 'fluxible/addons/BaseStore';
import cloneDeep from 'lodash/cloneDeep';
import find from 'lodash/find';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import orderBy from 'lodash/orderBy';
import moment from 'moment';

import { getNameLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import { getOldSearchesStorage, setOldSearchesStorage } from './localStorage';

/**
 * The current version number of this store.
 */
export const STORE_VERSION = 3;

/**
 * The maximum amount of time in seconds a stored item will be returned.
 */
export const STORE_PERIOD = 60 * 60 * 24 * 60; // 60 days

const isCurrentLocationItem = item =>
  get(item, 'item.type') === 'CurrentLocation';

class OldSearchesStore extends Store {
  static storeName = 'OldSearchesStore';

  // eslint-disable-next-line class-methods-use-this
  getStorageObject() {
    let storage = getOldSearchesStorage();
    if (
      !storage ||
      storage.version == null ||
      storage.version < STORE_VERSION
    ) {
      storage = {
        version: STORE_VERSION,
        items: [],
      };
      setOldSearchesStorage(storage);
    }
    return storage;
  }

  saveSearch(search) {
    if (isCurrentLocationItem(search)) {
      return;
    }
    const { items } = this.getStorageObject();

    const key = getNameLabel(search.item.properties, true);
    const found = find(items, oldItem =>
      isEqual(key, getNameLabel(oldItem.item.properties, true)),
    );

    const timestamp = moment().unix();
    if (found != null) {
      found.count += 1;
      found.lastUpdated = timestamp;
      found.item = cloneDeep(search.item);
    } else {
      items.push({
        count: 1,
        lastUpdated: timestamp,
        ...search,
      });
    }

    setOldSearchesStorage({
      version: STORE_VERSION,
      items: orderBy(items, 'count', 'desc'),
    });

    this.emitChange();
  }

  getOldSearches(type) {
    const { items } = this.getStorageObject();
    const timestamp = moment().unix();
    return items
      .filter(
        item =>
          (type ? item.type === type : true) &&
          (item.lastUpdated
            ? timestamp - item.lastUpdated < STORE_PERIOD
            : true) &&
          !isCurrentLocationItem(item),
      )
      .map(item => item.item);
  }

  clearOldSearches() {
    const storage = {
      version: STORE_VERSION,
      items: [],
    };
    setOldSearchesStorage(storage);
    this.emitChange();
  }

  getOldSearchItems() {
    const { items } = this.getStorageObject();
    const timestamp = moment().unix();
    return items.filter(
      item =>
        (item.lastUpdated
          ? timestamp - item.lastUpdated < STORE_PERIOD
          : true) && !isCurrentLocationItem(item),
    );
  }

  saveOldSearchItems(items) {
    setOldSearchesStorage({
      version: STORE_VERSION,
      items: orderBy(items, 'count', 'desc'),
    });
    this.emitChange();
  }

  static handlers = {
    SaveSearch: 'saveSearch',
    SaveSearchItems: 'saveOldSearchItems',
  };
}

export default OldSearchesStore;
