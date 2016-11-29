import { createHistory, createMemoryHistory } from 'history';
import { useRouterHistory } from 'react-router';
import localStorageHistory from './localStorageHistory';

import config from './config';

const isBrowser = typeof window !== 'undefined';
const isIosApp = isBrowser && window.navigator.standalone;

const args = {
  basename: config.APP_PATH,
};

const history = isIosApp ?
  // custom local Storage based history for ios app mode
  useRouterHistory(() => {
    const h = createMemoryHistory({ entries: localStorageHistory.entries });
    h.listen((event) => {
      if (localStorageHistory[event.action] !== undefined) {
        localStorageHistory[event.action](event);
      }
    });
    return h;
  })(args) : useRouterHistory((isBrowser ? createHistory : createMemoryHistory))(args);

export default history;
