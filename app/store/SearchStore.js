import Store from 'fluxible/addons/BaseStore';

class SearchStore extends Store {
  static storeName = 'SearchStore';

  openDialog(tab) {
    this.emitChange({
      action: 'open',
      data: tab,
    });
  }

  static handlers = {
    OpenDialog: 'openDialog',
  };
}

export default SearchStore;
