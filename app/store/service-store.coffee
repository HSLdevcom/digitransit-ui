Store = require 'fluxible/addons/BaseStore'

class ServiceStore extends Store

  @storeName: 'ServiceStore'

  constructor: (dispatcher) ->
    super(dispatcher)
    if window.location.search?.indexOf('mock') > -1
      window.mock = @mock =
        data: {}
      window.mock.geolocation = @makeMockGeolocation()

  geolocator: ->
    geolocation: @mock?.geolocation or navigator.geolocation

  notify: (disableDebounce) ->
    window.retrieveGeolocation(window.mock.data.position, disableDebounce)

  makeMockGeolocation: ->
    follow = false
    window.mock.data.position =
      coords:
        latitude: 60.1992
        longitude: 24.9402
        heading: 0
    @notify()

    demo: () ->
      from = window.mock.data.position.coords
      to =
        latitude: 60.1716
        longitude: 24.9406
      steps = 180
      track = []
      for i in [0...steps]
        f = i / steps
        variation = Math.random() * 0.0001 - 0.00005
        lat = f * to.latitude + (1.0 - f) * from.latitude + variation
        lon = f * to.longitude + (1.0 - f) * from.longitude + variation
        track.push
          latitude: lat
          longitude: lon
      follow =
        track: track
        index: 0
        interval: setInterval @followTrack, 1000
    followTrack: () ->
      i = follow.index or 0
      if follow.track and i < follow.track.length
        position = follow.track[i]
        ++follow.index
        window.mock.geolocation.setCurrentPosition position.latitude, position.longitude
      else
        clearInterval follow.interval
        follow = false
    move: (dlat, dlon, heading) =>
      window.mock.data.position.coords.latitude += dlat
      window.mock.data.position.coords.longitude += dlon
      window.mock.data.position.coords.heading = heading if heading
      @notify()
    setCurrentPosition: (lat, lon, heading, disableDebounce) =>
      window.mock.data.position.coords.latitude = lat
      window.mock.data.position.coords.longitude = lon
      window.mock.data.position.coords.heading = heading if heading
      @notify(disableDebounce)

  @handlers:
    'geolocator': 'geolocator'

module.exports = ServiceStore
