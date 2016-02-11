Store = require 'fluxible/addons/BaseStore'

class SearchStore extends Store
  @storeName: 'SearchStore'

  @action = undefined
  @position = undefined

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false

  isModalOpen: () ->
    @modalOpen

  getAction: () ->
    @action

  getPosition: () ->
    @position

  openSearch: (props) ->
    @modalOpen = true
    @action = props.action
    @position = props.position
    @emitChange(props)

  closeSearch: () ->
    @modalOpen = false
    @action = undefined
    @position = undefined
    @emitChange()

  @handlers:
    "OpenSearch": 'openSearch'
    "CloseSearch": 'closeSearch'

module.exports = SearchStore
