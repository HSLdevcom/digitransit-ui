import Store from 'fluxible/addons/BaseStore';

class SearchStore extends Store {
  static storeName = 'SearchStore';

  saveSuggestionsResult(suggestions) {
    this.emitChange({
      action: 'suggestions',
      data: suggestions,
    });
  }

  openDialog(tab) {
    this.emitChange({
      action: 'open',
      data: tab,
    });
  }

  static handlers = {
    SuggestionsResult: 'saveSuggestionsResult',
    OpenDialog: 'openDialog',
  };
}

export default SearchStore;
