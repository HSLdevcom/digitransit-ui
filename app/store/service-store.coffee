Store = require 'fluxible/addons/BaseStore'

class ServiceStore extends Store

  @storeName: 'ServiceStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    if window.location.search?.indexOf('mock') > -1
      window.mock = @mock =
        data: {}
      window.mock.geolocation =  @makeMockGeolocation()

  geolocator: ->
    geolocation: @mock?.geolocation or navigator.geolocation

  makeMockGeolocation: ->
    window.mock.data.position =
      coords:
        latitude: 60.1992
        longitude: 24.9402
        heading: 0
    move: (dlat, dlon, heading) ->
      window.mock.data.position.coords.latitude += dlat
      window.mock.data.position.coords.longitude += dlon
      window.mock.data.position.coords.heading = heading if heading
    setCurrentPosition: (lat, lon, heading) ->
      window.mock.data.position.coords.latitude = lat
      window.mock.data.position.coords.longitude = lon
      window.mock.data.position.coords.heading = heading if heading
    getCurrentPosition: (callback) ->
      callback(window.mock.data.position)
    watchPosition: (callback) ->
      callback(window.mock.data.position)
      setInterval () ->
        callback(window.mock.data.position)
      , 100
    clearWatch: (id) ->
      clearInterval id

  @handlers:
    'geolocator': 'geolocator'

module.exports = ServiceStore
