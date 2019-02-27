import { createHistory, createMemoryHistory, useQueries } from 'history';
import { useRouterHistory } from 'react-router';
import createLocalStorageHistory from './localStorageHistory';
import { isIOSApp, isBrowser } from './util/browser';

const ROOT_PATH = '/';

/**
 * Gives the proper function to create a history object for the application.
 *
 * @param {string} path the current url path.
 * @param {boolean} browser whether the code is currently running in a browser.
 * @param {boolean} iosApp whether the code is currently running as an iOS PWA.
 */
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

/**
 * Constructs a router with a suitable history handler for the application.
 *
 * @param {{ APP_PATH: string }} config the current configuration.
 * @param {string} path the current url path.
 * @param {boolean} browser whether the code is currently running in a browser.
 */
const history = (config, path = ROOT_PATH, browser = isBrowser) => {
  const historyCreator = getCreateHistoryFunction(path, browser);
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
