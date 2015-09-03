Store = require 'fluxible/addons/BaseStore'

class DisruptionStore extends Store
  @storeName: 'DisruptionStore'

  getData: ->
    @data

  storeDisruptions: (data) ->
    @data = data
    @emitChange()

  dehydrate: ->
    @data

  rehydrate: (data) ->
    @data = data

  @handlers:
    "UpdateDisruptions": 'storeDisruptions'

module.exports = DisruptionStore
