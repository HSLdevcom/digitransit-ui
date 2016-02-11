Store = require 'fluxible/addons/BaseStore'

class SearchStore extends Store
  @storeName: 'SearchStore'

  @action = undefined

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false

  isModalOpen: () ->
    @modalOpen

  getAction: () ->
    @action

  openSearch: (props) ->
    @modalOpen = true
    @action = props.action
    @emitChange(props)

  closeSearch: () ->
    @modalOpen = false
    @action = undefined
    @emitChange()

  @handlers:
    "OpenSearch": 'openSearch'
    "CloseSearch": 'closeSearch'

module.exports = SearchStore
