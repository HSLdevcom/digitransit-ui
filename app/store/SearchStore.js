import Store from 'fluxible/addons/BaseStore';

class SearchStore extends Store {
  static storeName = 'SearchStore';

  saveSuggestionsResult(suggestions) {
    this.suggestions = suggestions;

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

  getSuggestions() {
    return this.suggestions;
  }

  static handlers = {
    SuggestionsResult: 'saveSuggestionsResult',
    OpenDialog: 'openDialog',
  };
}

export default SearchStore;
