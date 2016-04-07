Store              = require 'fluxible/addons/BaseStore'

class SearchStore extends Store
  @storeName: 'SearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)

  saveSuggestionsResult: (suggestions) ->
    @suggestions = suggestions
    @emitChange()

  getSuggestions: () ->
    return @suggestions

  @handlers:
    "SuggestionsResult": 'saveSuggestionsResult'

module.exports = SearchStore
