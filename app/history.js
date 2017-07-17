import { createHistory, createMemoryHistory, useQueries } from 'history';
import { useRouterHistory } from 'react-router';
import createLocalStorageHistory from './localStorageHistory';
import { isIOSApp, isBrowser } from './util/browser';

let createHistoryFunction;

if (isIOSApp) {
  createHistoryFunction = createLocalStorageHistory;
} else if (isBrowser) {
  createHistoryFunction = createHistory;
} else {
  createHistoryFunction = createMemoryHistory;
}

const history = config => useRouterHistory(useQueries(createHistoryFunction))({
  basename: config.APP_PATH,
});

export default history;
