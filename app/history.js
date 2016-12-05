import { createHistory, createMemoryHistory } from 'history';
import { useRouterHistory } from 'react-router';
import localStorageHistory from './localStorageHistory';
import { isIOSApp, isBrowser } from './util/browser';

import config from './config';

const args = {
  basename: config.APP_PATH,
};

const history = isIOSApp ?
  // custom local Storage based history for ios app mode
  useRouterHistory(() => {
    const h = createMemoryHistory({
      current: localStorageHistory.getIndex(),
      entries: localStorageHistory.getEntries(),
    });
    h.listen((event) => {
      if (localStorageHistory[event.action] !== undefined) {
        localStorageHistory[event.action](event);
      }
    });
    return h;
  })(args) : useRouterHistory((isBrowser ? createHistory : createMemoryHistory))(args);

export default history;
