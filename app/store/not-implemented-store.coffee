Store    = require 'fluxible/addons/BaseStore'

class NotImplementedStore extends Store

  @storeName: 'NotImplementedStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @feature = {}

  click: (feature) =>
    @feature = feature
    @emitChange(feature)

  getName: =>
    @feature.name

  @handlers:
    "click": "click"

module.exports = NotImplementedStore
