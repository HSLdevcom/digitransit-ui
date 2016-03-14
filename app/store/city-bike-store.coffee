Store = require 'fluxible/addons/BaseStore'

class CityBikeStore extends Store
  @storeName: 'CityBikeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    @data = {}

  getData: ->
    @data

  getStation: (id) ->
    for i of @data.stations
      station = @data.stations[i]
      if station.id == id
        return station
    return

  storeCityBikeStationSearch: (data) ->
    @data = data
    @emitChange()

  @handlers:
    "CityBikeStationsFound": 'storeCityBikeStationSearch'

module.exports = CityBikeStore
