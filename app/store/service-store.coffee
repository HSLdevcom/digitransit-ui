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
    return {
      geolocation: @mock?.geolocation or navigator.geolocation
    }

  makeMockGeolocation: ->
    watchers = [];
    window.mock.data.position =
      coords:
        latitude: 60.1992
        longitude: 24.9402
        heading: 0
    return {
      setCurrentCoords: (coords) ->
        this.setCurrentPosition
          coords: coords
      setCurrentPosition: (position) ->
        window.mock.data.position = position;
        for watcher in watchers
          watcher position
      getCurrentPosition: (callback) ->
        callback(window.mock.data.position)
      watchPosition: (callback) ->
        watchers.push callback;
      clearWatch: (id) ->
        delete watchers[id]
    }

  @handlers:
    "geolocator": 'geolocator'

module.exports = ServiceStore
