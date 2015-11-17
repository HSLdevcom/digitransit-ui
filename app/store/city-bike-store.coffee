Store = require 'fluxible/addons/BaseStore'

STORAGE_KEY = "cityBikeStations"

class CityBikeStore extends Store
  @storeName: 'CityBikeStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    localData = window?.sessionStorage?.getItem STORAGE_KEY
    @data = if localData then JSON.parse(localData) else {}

  getData: ->
    @data

  storeCityBikeStationSearch: (data) ->
    @data = data
    window?.sessionStorage?.setItem STORAGE_KEY, JSON.stringify @data
    @emitChange()

  @handlers:
    "CityBikeStationsFound": 'storeCityBikeStationSearch'

module.exports = CityBikeStore
