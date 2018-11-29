import { createHistory, createMemoryHistory, useQueries } from 'history';
import { useRouterHistory } from 'react-router';
import createLocalStorageHistory from './localStorageHistory';
import { isIOSApp, isBrowser } from './util/browser';

const ROOT_PATH = '/';

const getCreateHistoryFunction = path => {
  if (isIOSApp) {
    if (path !== ROOT_PATH) {
      return createHistory;
    }
    return createLocalStorageHistory;
  }
  if (isBrowser) {
    return createHistory;
  }
  return createMemoryHistory;
};

const history = (config, path = undefined) =>
  useRouterHistory(useQueries(getCreateHistoryFunction(path)))({
    basename: config.APP_PATH,
  });

export default history;
