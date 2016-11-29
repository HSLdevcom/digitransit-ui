import { setHistory, getHistory } from './store/localStorage';

// minimial serializable history state (just the paths)
const entries = getHistory().length > 0 ? getHistory() : ['/', '/'];

const PUSH = (entry) => {
  entries.push(entry.pathname);
  setHistory(entries);
};

const POP = () => {
  if (entries.length > 0) {
    entries.length = entries.length - 1;
  }
  console.log('saving:', entries);
  setHistory(entries);
};

export default { PUSH, POP, entries };
