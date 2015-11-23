Store = require 'fluxible/addons/BaseStore'

class CityBikeStore extends Store
  @storeName: 'CityBikeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @data = {}

  getData: ->
    @data

  storeCityBikeStationSearch: (data) ->
    @data = data
    @emitChange()

  @handlers:
    "CityBikeStationsFound": 'storeCityBikeStationSearch'

module.exports = CityBikeStore
