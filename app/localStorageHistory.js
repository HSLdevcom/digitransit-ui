import { createMemoryHistory } from 'history';
import { setHistory, getHistory } from './store/localStorage';

function getHistoryConsideringTime() {
  const history = getHistory();
  if (history.time > Date.now() - 60 * 60 * 1000) {
    return history;
  }
  return { entries: ['/'], index: 0, time: 0 };
}

// minimial serializable history state (just the paths)
const history = getHistoryConsideringTime();

let isInitialized = false;

const saveHistory = () => {
  setHistory({ ...history, time: Date.now() });
};

const PUSH = entry => {
  history.entries.splice(history.index + 1);
  history.entries.push(entry);
  history.index += 1;
  saveHistory();
};

const POP = () => {
  if (isInitialized && history.index > 0) {
    history.index -= 1;
    saveHistory();
  } else if (!isInitialized) {
    isInitialized = true;
  }
};

const REPLACE = entry => {
  history.entries.splice(history.index);
  history.entries.push(entry);
  saveHistory();
};

const getEntries = () => history.entries;
const getIndex = () => history.index;

const getLocationListener = () => event => {
  switch (event.action) {
    case 'POP':
      POP(event);
      break;
    case 'REPLACE':
      REPLACE(event);
      break;
    case 'PUSH':
      PUSH(event);
      break;
    default:
      // eslint-disable-next-line no-console
      console.error('unhandled history event:', event);
  }
  if (this && this[event.action] !== undefined) {
    this[event.action](event);
  }
};

const createLocalStorageHistory = () => {
  const hist = createMemoryHistory({
    current: getIndex(),
    entries: getEntries(),
  });
  hist.listen(getLocationListener());
  return hist;
};

export { createLocalStorageHistory as default, getIndex, getLocationListener };
