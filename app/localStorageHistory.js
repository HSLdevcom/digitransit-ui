import { createMemoryHistory } from 'history';
import { setHistory, getHistory } from './store/localStorage';

// minimial serializable history state (just the paths)
const history = getHistory();

const saveHistory = () => {
  setHistory(history);
};

const PUSH = (entry) => {
  history.entries.splice(history.index + 1);
  history.entries.push(entry.pathname);
  history.index += 1;
  saveHistory();
};


const POP = () => {
  if (history.index > 0) {
    history.index -= 1;
    saveHistory();
  }
};

const REPLACE = (entry) => {
  history.entries.splice(history.index);
  history.entries.push(entry.pathname);
  saveHistory();
};

const getEntries = () => (history.entries);
const getIndex = () => (history.index);

const createLocalStorageHistory = () => {
  const hist = createMemoryHistory({
    current: getIndex(),
    entries: getEntries(),
  });
  hist.listen((event) => {
    switch (event.action) {
      case 'POP': POP(event); break; // eslint-disable-line new-cap
      case 'REPLACE': REPLACE(event); break;  // eslint-disable-line new-cap
      case 'PUSH': PUSH(event); break; // eslint-disable-line new-cap
      default:
        console.error('unhandled history event:', event);
    }
    if (this[event.action] !== undefined) {
      this[event.action](event);
    }
  });
  return hist;
};

export { createLocalStorageHistory as default, getIndex };
