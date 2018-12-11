import { createHistory, createMemoryHistory, useQueries } from 'history';
import { useRouterHistory } from 'react-router';
import createLocalStorageHistory from './localStorageHistory';
import { isIOSApp, isBrowser } from './util/browser';

const ROOT_PATH = '/';

export const getCreateHistoryFunction = (
  path = ROOT_PATH,
  browser = isBrowser,
  iosApp = isIOSApp,
) => {
  if (iosApp) {
    if (path !== ROOT_PATH) {
      return createHistory;
    }
    return createLocalStorageHistory;
  }
  if (browser) {
    return createHistory;
  }
  return createMemoryHistory;
};

const history = (config, path = ROOT_PATH) =>
  useRouterHistory(useQueries(getCreateHistoryFunction(path)))({
    basename: config.APP_PATH,
  });

export default history;
