Store = require 'fluxible/addons/BaseStore'

class SearchStore extends Store
  @storeName: 'SearchStore'

  @action = undefined
  @position = undefined
  @placeholder = undefined

  constructor: (dispatcher) ->
    super(dispatcher)
    @modalOpen = false

  isModalOpen: () ->
    @modalOpen

  getAction: () ->
    @action

  getPlaceholder: () ->
    @placeholder

  getPosition: () ->
    @position

  openSearch: (props) ->
    @modalOpen = true
    @action = props.action
    @position = props.position
    @placeholder = props.placeholder
    @emitChange(props)

  closeSearch: () ->
    @modalOpen = false
    @action = undefined
    @position = undefined
    @placeholder = undefined
    @emitChange()

  @handlers:
    "OpenSearch": 'openSearch'
    "CloseSearch": 'closeSearch'

module.exports = SearchStore
