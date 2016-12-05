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

export default { PUSH, POP, REPLACE, getEntries, getIndex };
