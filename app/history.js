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
    try {
      if (window.sessionStorage) {
        return createHistory;
      }
    } catch (error) {
      return createMemoryHistory;
    }
  }
  return createMemoryHistory;
};

const history = (config, path = ROOT_PATH) => {
  const historyCreator = getCreateHistoryFunction(path);
  const router = useRouterHistory(useQueries(historyCreator))({
    basename: config.APP_PATH,
  });
  if (
    path !== ROOT_PATH &&
    (historyCreator === createMemoryHistory ||
      historyCreator === createLocalStorageHistory)
  ) {
    router.replace(path);
  }
  return router;
};

export default history;
