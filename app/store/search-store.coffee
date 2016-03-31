Store              = require 'fluxible/addons/BaseStore'

class SearchStore extends Store
  @storeName: 'SearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false
    @actionTarget = undefined
    @position = undefined
    @placeholder = undefined
    @action = undefined

  isModalOpen: () =>
    @modalOpen

  getActionTarget: () =>
    @actionTarget

  getAction: () =>
    @action

  getPlaceholder: () =>
    @placeholder

  getPosition: () =>
    @position

  saveSuggestionsResult: (suggestions) ->
    @suggestions = suggestions
    @emitChange()

  getSuggestions: () ->
    return @suggestions

  openSearch: (props) ->
    @modalOpen = true
    @actionTarget = props.actionTarget
    @position = props.position
    @placeholder = props.placeholder
    @action = props.action
    @emitChange init: true

  closeSearch: () ->
    @modalOpen = false
    @actionTarget = undefined
    @position = undefined
    @placeholder = undefined
    @action = undefined
    @emitChange()

  @handlers:
    "OpenSearch": 'openSearch'
    "CloseSearch": 'closeSearch'
    "SuggestionsResult": 'saveSuggestionsResult'

module.exports = SearchStore
