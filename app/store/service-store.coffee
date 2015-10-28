Store = require 'fluxible/addons/BaseStore'

class ServiceStore extends Store

  @storeName: 'ServiceStore'

  mockData =
    position:
      coords:
        latitude: 60.2
        longitude: 24.95
        heading: 0

  constructor: (dispatcher) ->
    super(dispatcher)

  geolocator: ->
    if window.location.search?.indexOf('mock') > -1
      geolocation:
        getCurrentPosition: (callback) ->
          callback(mockData.position)
        watchPosition: (callback) ->
          console.log('watch')
        clearWatch: (id) ->
          console.log('clear')
    else
      geolocation:
        navigator.geolocation

  @handlers:
    "geolocator": 'geolocator'

module.exports = ServiceStore
