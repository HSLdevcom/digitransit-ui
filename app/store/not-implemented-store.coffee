Store    = require 'fluxible/addons/BaseStore'

class NotImplementedStore extends Store

  constructor: (dispatcher) ->
    super(dispatcher)
    @feature={}

  click: (feature) =>
    @feature = feature
    console.log("not implemented click", feature)
    @emitChange(feature)

  getId: =>
    @feature.id

  getDefaultMessage: =>
    @feature.defaultMessage

  getName: =>
    @feature.name

  @handlers:
    "click": "click"

module.exports = NotImplementedStore
