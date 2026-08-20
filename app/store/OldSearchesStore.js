import Store from 'fluxible/addons/BaseStore';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import orderBy from 'lodash/orderBy';
import { getNameLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import { unixTime } from '../util/timeUtils';
import { getOldSearchesStorage, setOldSearchesStorage } from './localStorage';

/**
 * The current version number of this store.
 */
export const STORE_VERSION = 3;

/**
 * The maximum amount of time in seconds a stored item will be returned.
 */
export const STORE_PERIOD = 60 * 60 * 24 * 60; // 60 days

const getItemKey = properties => {
  if (properties.layer?.startsWith('route-') && properties.gtfsId) {
    return [properties.gtfsId];
  }
  return getNameLabel(properties, true);
};

const deduplicateItems = items => {
  const uniqueItems = [];
  items.forEach(item => {
    if (!item.item?.properties) {
      uniqueItems.push(item);
      return;
    }
    const key = getItemKey(item.item.properties);
    const existingIndex = uniqueItems.findIndex(
      existingItem =>
        existingItem.item?.properties &&
        isEqual(key, getItemKey(existingItem.item.properties)),
    );
    if (existingIndex === -1) {
      uniqueItems.push(item);
    } else if (item.count > uniqueItems[existingIndex].count) {
      uniqueItems[existingIndex] = item;
    }
  });
  return uniqueItems;
};

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
    const items = deduplicateItems(storage.items);
    if (items.length !== storage.items.length) {
      storage = { ...storage, items };
      setOldSearchesStorage(storage);
    }
    return storage;
  }

  saveSearch(search) {
    const { items } = this.getStorageObject();

    const key = getItemKey(search.item.properties);
    const matches = items.filter(oldItem =>
      isEqual(key, getItemKey(oldItem.item.properties)),
    );

    const timestamp = unixTime();
    let updatedItems;
    if (matches.length > 0) {
      // Keep the entry with the highest count and discard duplicates.
      const best = matches.reduce((a, b) => (b.count > a.count ? b : a));
      best.count += 1;
      best.lastUpdated = timestamp;
      best.item = cloneDeep(search.item);
      updatedItems = [
        ...items.filter(
          oldItem => !isEqual(key, getItemKey(oldItem.item.properties)),
        ),
        best,
      ];
    } else {
      updatedItems = [
        ...items,
        { count: 1, lastUpdated: timestamp, ...search },
      ];
    }

    setOldSearchesStorage({
      version: STORE_VERSION,
      items: orderBy(updatedItems, 'count', 'desc'),
    });

    this.emitChange();
  }

  removeSearch(search) {
    const { items } = this.getStorageObject();

    const key = getItemKey(search.item.properties);
    for (let i = 0; i < items.length; i++) {
      if (isEqual(key, getItemKey(items[i].item.properties))) {
        // remove
        items.splice(i, 1);
        setOldSearchesStorage({
          version: STORE_VERSION,
          items: orderBy(items, 'count', 'desc'),
        });
        this.emitChange();
        break;
      }
    }
  }

  getOldSearches(type) {
    const { items } = this.getStorageObject();
    const timestamp = unixTime();
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
    const timestamp = unixTime();
    return items.filter(item =>
      item.lastUpdated ? timestamp - item.lastUpdated < STORE_PERIOD : true,
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
    RemoveSearch: 'removeSearch',
    SaveSearchItems: 'saveOldSearchItems',
  };
}

export default OldSearchesStore;
