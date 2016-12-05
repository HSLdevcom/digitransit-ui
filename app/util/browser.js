import localStorageHistory from '../localStorageHistory';

export const isBrowser = typeof window !== 'undefined' && window !== null;
export const isIOSApp = isBrowser && navigator.standalone;

export const hasHistoryEntries = () =>
  (isIOSApp && localStorageHistory.getIndex() > 0) || (isBrowser && window.history.length);
