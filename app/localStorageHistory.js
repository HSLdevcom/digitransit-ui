import { setHistory, getHistory } from './store/localStorage';

// minimial serializable history state (just the paths)
const entries = getHistory().length > 0 ? getHistory() : ['/'];

const PUSH = (entry) => {
  entries.push(entry.pathname);
  setHistory(entries);
};

const POP = () => {
  if (entries.length > 0) {
    entries.splice(entries.length - 1);
    setHistory(entries);
  }
};

const REPLACE = (entry) => {
  POP();
  PUSH(entry);
};

export default { PUSH, POP, REPLACE, entries };
