import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import orderBy from 'lodash/orderBy';
import { getNameLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
import { unixTime } from '../../utils/client/timeUtils';
import {
  getOldSearchesStorage,
  setOldSearchesStorage,
} from '../../utils/client/localStorage';

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
    // Items without properties are malformed/unusable downstream, drop them.
    if (!item.item.properties) {
      return;
    }
    const key = getItemKey(item.item.properties);
    const existingIndex = uniqueItems.findIndex(existingItem =>
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

/**
 * Reads the stored history, initializing or deduplicating it when needed.
 */
export const getStorageObject = () => {
  let storage = getOldSearchesStorage();
  if (!storage || storage.version == null || storage.version < STORE_VERSION) {
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
};

export const saveSearch = search => {
  const { items } = getStorageObject();

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
    updatedItems = [...items, { count: 1, lastUpdated: timestamp, ...search }];
  }

  setOldSearchesStorage({
    version: STORE_VERSION,
    items: orderBy(updatedItems, 'count', 'desc'),
  });
};

export const removeSearch = search => {
  const { items } = getStorageObject();

  const key = getItemKey(search.item.properties);
  for (let i = 0; i < items.length; i++) {
    if (isEqual(key, getItemKey(items[i].item.properties))) {
      // remove
      items.splice(i, 1);
      setOldSearchesStorage({
        version: STORE_VERSION,
        items: orderBy(items, 'count', 'desc'),
      });
      break;
    }
  }
};

export const clearOldSearches = () => {
  const storage = {
    version: STORE_VERSION,
    items: [],
  };
  setOldSearchesStorage(storage);
};

export const getOldSearchItems = () => {
  const { items } = getStorageObject();
  const timestamp = unixTime();
  return items.filter(item =>
    item.lastUpdated ? timestamp - item.lastUpdated < STORE_PERIOD : true,
  );
};

export const getOldSearches = type => {
  return getOldSearchItems()
    .filter(item => (type ? item.type === type : true))
    .map(item => item.item);
};

export const saveOldSearchItems = items => {
  setOldSearchesStorage({
    version: STORE_VERSION,
    items: orderBy(items, 'count', 'desc'),
  });
};
