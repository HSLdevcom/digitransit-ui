import { createHistory, createMemoryHistory } from 'history';
import { useRouterHistory } from 'react-router';

import config from './config';

const isBrowser = typeof window !== 'undefined';

const history = useRouterHistory((isBrowser ? createHistory : createMemoryHistory))({
  basename: config.APP_PATH,
});

export default history;
