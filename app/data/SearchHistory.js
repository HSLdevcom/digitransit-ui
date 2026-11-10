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
 * The maximum amount of time in seconds a stored item is kept.
 */
export const STORE_PERIOD = 60 * 60 * 24 * 60; // 60 days

/**
 * The maximum number of items kept in the stored history.
 */
export const STORE_MAX_ITEMS = 120;

/**
 * The number of most recent items that are never dropped by the item limit,
 * so that a new search is not lost to items with a higher count.
 */
export const STORE_KEEP_LATEST = 20;

const getItemKey = properties => {
  if (properties.layer?.startsWith('route-') && properties.gtfsId) {
    return [properties.gtfsId];
  }
  return getNameLabel(properties, true);
};

const isFresh = (item, timestamp) =>
  item.lastUpdated ? timestamp - item.lastUpdated < STORE_PERIOD : true;

// Keeps the highest-count item for each key in a single pass.
const deduplicateItems = items => {
  const uniqueItems = [];
  const indexByKey = new Map();
  items.forEach(item => {
    // Items without properties are malformed/unusable downstream, drop them.
    if (!item.item.properties) {
      return;
    }
    const key = JSON.stringify(getItemKey(item.item.properties));
    const existingIndex = indexByKey.get(key);
    if (existingIndex === undefined) {
      indexByKey.set(key, uniqueItems.length);
      uniqueItems.push(item);
    } else if (item.count > uniqueItems[existingIndex].count) {
      uniqueItems[existingIndex] = item;
    }
  });
  return uniqueItems;
};

// Drops expired and duplicate items. If there are still too many, keeps the
// most recent items and fills the rest with the most used and then most recent.
const normalizeItems = items => {
  const timestamp = unixTime();
  const unique = deduplicateItems(items.filter(i => isFresh(i, timestamp)));
  if (unique.length <= STORE_MAX_ITEMS) {
    return unique;
  }
  const byRecency = orderBy(unique, [i => i.lastUpdated || 0], ['desc']);
  const latest = byRecency.slice(0, STORE_KEEP_LATEST);
  const others = orderBy(
    byRecency.slice(STORE_KEEP_LATEST),
    ['count', i => i.lastUpdated || 0],
    ['desc', 'desc'],
  ).slice(0, STORE_MAX_ITEMS - STORE_KEEP_LATEST);
  return orderBy([...latest, ...others], 'count', 'desc');
};

// The history is read from localStorage once per page session. All changes go
// through this module, which keeps the cache and the storage in sync.
let cache = null;

const persist = items => {
  cache = { version: STORE_VERSION, items: orderBy(items, 'count', 'desc') };
  setOldSearchesStorage(cache);
};

/**
 * Drops the in-memory copy so that the history is re-read from localStorage.
 */
export const resetSearchHistoryCache = () => {
  cache = null;
};

// Another tab changed the history; drop the stale copy so it isn't overwritten.
window.addEventListener('storage', event => {
  if (event.key === null || event.key === 'saved-searches') {
    resetSearchHistoryCache();
  }
});

const loadStorage = () => {
  const stored = getOldSearchesStorage();
  const isCurrent = stored.version != null && stored.version >= STORE_VERSION;
  const items = isCurrent ? normalizeItems(stored.items) : [];
  if (!isCurrent || items.length !== stored.items.length) {
    persist(items);
  } else {
    cache = { version: STORE_VERSION, items };
  }
  return cache;
};

/**
 * Returns the stored history. It is read from localStorage once per session.
 * Expired, duplicate and surplus items are removed at that point.
 */
export const getStorageObject = () => cache || loadStorage();

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
    updatedItems = [
      ...items.filter(
        oldItem => !isEqual(key, getItemKey(oldItem.item.properties)),
      ),
      {
        ...best,
        count: best.count + 1,
        lastUpdated: timestamp,
        item: cloneDeep(search.item),
      },
    ];
  } else {
    updatedItems = [...items, { count: 1, lastUpdated: timestamp, ...search }];
  }

  persist(updatedItems);
};

export const removeSearch = search => {
  const { items } = getStorageObject();

  const key = getItemKey(search.item.properties);
  const remaining = items.filter(
    item => !isEqual(key, getItemKey(item.item.properties)),
  );
  if (remaining.length !== items.length) {
    persist(remaining);
  }
};

export const clearOldSearches = () => {
  persist([]);
};

// Callers may modify the results, so they get copies of the cached items.
export const getOldSearches = type =>
  cloneDeep(
    getStorageObject()
      .items.filter(item => (type ? item.type === type : true))
      .map(item => item.item),
  );
