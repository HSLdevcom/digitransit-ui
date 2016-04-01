Store              = require 'fluxible/addons/BaseStore'

class SearchStore extends Store
  @storeName: 'SearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false
    @actionTarget = undefined
    @placeholder = undefined
    @action = undefined

  isModalOpen: () =>
    @modalOpen

  getActionTarget: () =>
    @actionTarget

  setActionTarget: (actionTarget) =>
    @actionTarget = actionTarget
    @emitChange()

  getAction: () =>
    @action

  getPlaceholder: () =>
    @placeholder

  saveSuggestionsResult: (suggestions) ->
    @suggestions = suggestions
    @emitChange()

  getSuggestions: () ->
    return @suggestions

  openSearch: (props) ->
    @modalOpen = true
    @actionTarget = props.actionTarget
    @placeholder = props.placeholder
    @action = props.action
    @emitChange init: true

  closeSearch: () ->
    @modalOpen = false
    @actionTarget = undefined
    @placeholder = undefined
    @action = undefined
    @emitChange()

  @handlers:
    "OpenSearch": 'openSearch'
    "CloseSearch": 'closeSearch'
    "ChangeActionTarget": 'setActionTarget'
    "SuggestionsResult": 'saveSuggestionsResult'

module.exports = SearchStore
