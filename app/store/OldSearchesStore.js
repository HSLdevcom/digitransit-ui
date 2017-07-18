import Store from 'fluxible/addons/BaseStore';
import orderBy from 'lodash/orderBy';
import find from 'lodash/find';
import isEqual from 'lodash/isEqual';

import { getOldSearchesStorage, setOldSearchesStorage } from './localStorage';
import { getLabel } from '../util/suggestionUtils';

class OldSearchesStore extends Store {
  static storeName = 'OldSearchesStore';

  constructor(dispatcher) {
    super(dispatcher);

    const oldSearches = getOldSearchesStorage();
    if (
      !oldSearches ||
      oldSearches.version == null ||
      oldSearches.version < 2
    ) {
      setOldSearchesStorage({
        version: 2,
        items: [],
      });
    }
  }

  saveSearch(destination) {
    let searches = getOldSearchesStorage().items;

    const found = find(searches, oldItem =>
      isEqual(
        getLabel(destination.item.properties),
        getLabel(oldItem.item.properties),
      ),
    );

    if (found != null) {
      found.count += 1;
    } else {
      searches.push({ count: 1, ...destination });
    }

    setOldSearchesStorage({
      version: 2,
      items: orderBy(searches, 'count', 'desc'),
    });
    searches = this.getOldSearches();
    this.emitChange(destination);
  }

  // eslint-disable-next-line class-methods-use-this
  getOldSearches(type) {
    return (
      (getOldSearchesStorage().items &&
        getOldSearchesStorage().items
          .filter(item => (type ? item.type === type : true))
          .map(item => item.item)) ||
      []
    );
  }

  static handlers = {
    SaveSearch: 'saveSearch',
  };
}

export default OldSearchesStore;
