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
      notifyWatchers: ->
        for watcher in watchers
          watcher window.mock.data.position
      move: (dlat, dlon, heading) ->
        window.mock.data.position.coords.latitude += dlat
        window.mock.data.position.coords.longitude += dlon
        window.mock.data.position.coords.heading = heading if heading
        @notifyWatchers()
      setCurrentPosition: (lat, lon, heading) ->
        position =
          coords:
            latitude: lat
            longitude: lon
            heading: heading;
        window.mock.data.position = position
        @notifyWatchers()
      getCurrentPosition: (callback) ->
        callback(window.mock.data.position)
      watchPosition: (callback) ->
        watchers.push callback;
      clearWatch: (id) ->
        delete watchers[id]
    }

  @handlers:
    'geolocator': 'geolocator'

module.exports = ServiceStore
