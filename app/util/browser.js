import { getIndex } from '../localStorageHistory';

export const isBrowser = typeof window !== 'undefined' && window !== null;
export const isIOSApp = isBrowser && navigator.standalone;

export const isWindowsPhone = isBrowser && navigator.userAgent.includes('Windows Phone');
export const isLangMockEn = isBrowser && window.location.search.indexOf('en') !== -1;
export const hasHistoryEntries = () =>
  (isIOSApp && getIndex() > 0) || (isBrowser && window.history.length);
