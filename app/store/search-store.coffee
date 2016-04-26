Store              = require 'fluxible/addons/BaseStore'

class SearchStore extends Store
  @storeName: 'SearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)

  saveSuggestionsResult: (suggestions) ->
    @suggestions = suggestions
    @emitChange({action: "suggestions", data: suggestions})

  openDialog: (tab) ->
    @emitChange({action: "open", data: tab})

  getSuggestions: () ->
    return @suggestions

  @handlers:
    "SuggestionsResult": 'saveSuggestionsResult'
    "OpenDialog": 'openDialog'

module.exports = SearchStore
