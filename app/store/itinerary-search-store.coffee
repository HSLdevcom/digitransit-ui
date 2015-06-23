Store = require 'fluxible/addons/BaseStore'

class ItinerarySearchStore extends Store
  @storeName: 'ItinerarySearchStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @data = {}

  getData: ->
    @data

  storeItinerarySearch: (data) ->
    @data = data
    @emitChange()

  clearItinerary: ->
    @data = {}
    @emitChange()

  dehydrate: ->
    @data

  rehydrate: (data) ->
    @data = data

  @handlers:
    "ItineraryFound": 'storeItinerarySearch'
    "ItinerarySearchStarted": 'clearItinerary'

module.exports = ItinerarySearchStore