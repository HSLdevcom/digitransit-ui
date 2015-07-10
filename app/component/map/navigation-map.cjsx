React         = require 'react'
geoUtils      = require '../../util/geo-utils'
LocateActions = require '../../action/locate-actions.coffee'


class NavigationMap extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentWillMount: ->
    if window?
      @context.executeAction LocateActions.startLocationWatch

      # Lazy-load the map, as it is quite big (~400KB), and only needed in this component
      # Promise-loader returns a function, which returns the actual promise when called.
      @requirePromise = Promise.all [
        require('promise?global,mapboxgl!mapbox-gl/dist/mapbox-gl-dev')(),
        require('promise?global,mapboxgl!./mapbox-gl.css')(),
        require('promise?global,mapboxgl!../../../static/map/streets-v7.json')(),
        require('promise?global,mapboxgl!exports?window.FULLTILT!fulltilt/dist/fulltilt.js')()
      ]

  componentDidMount: ->
    @requirePromise.then ([mapboxgl, mapboxcss, mapStyle, Fulltilt]) =>
      coordinates = @context.getStore('LocationStore').getLocationState()
      plan = @context.getStore('ItinerarySearchStore').getData().plan.itineraries[@props.hash]
      @bearing = geoUtils.getBearing(
        plan.legs[0].from.lat, plan.legs[0].from.lon, plan.legs[0].to.lat, plan.legs[0].to.lon)
      map = new mapboxgl.Map(
        container: 'map'
        style: mapStyle
        center: [coordinates.lat, coordinates.lon]
        zoom: 16
        pitch: 45
        bearing: @bearing
      )

      mapLoaded = new Promise((resolve) -> map.on 'load', resolve)

      fulltiltLoaded = Fulltilt.getDeviceOrientation(type: 'world')

      mapLoaded.then =>
        map.addSource 'route',
          type: "geojson"
          data: geoUtils.dataAsGeoJSON plan

        for mode in ["walk", "bus", "tram", "subway", "rail", "ferry"]
          map.addLayer geoUtils.getLayerForMode(mode)

        @locationJSONsource = new mapboxgl.GeoJSONSource(
          data: geoUtils.locationAsGeoJSON coordinates
        )

        map.addSource 'location', @locationJSONsource
        map.addLayer geoUtils.getLayerforLocation()

        fulltiltLoaded.then(
          (orientation) => @initializeCompass(map, true, orientation)
        , (errror) => @initializeCompass(map, false)
        )

  initializeCompass: (map, compassAvailable, orientation) ->
    coordinates = @context.getStore('LocationStore').getLocationState()
    @intervalId = setInterval =>
      newCoordinates = @context.getStore('LocationStore').getLocationState()

      if newCoordinates.lon != coordinates.lat or newCoordinates.lon != coordinates.lon
        @locationJSONsource.setData geoUtils.locationAsGeoJSON coordinates
        coordinates = newCoordinates

      if compassAvailable
        euler = orientation.getScreenAdjustedEuler()
        @bearing = 360 - euler.alpha
        # Check that pitch could be calculated and that it is not negative
        @pitch = if !isNaN(euler.beta) then Math.max(euler.beta, 0) else 45
      else
        heading = coordinates.heading
        # Bearing might not be availabe from the GPS, then use the previous value
        @bearing = if heading or heading == 0 then heading else @bearing
        @pitch = 45

      map.easeTo
        center: [coordinates.lat, coordinates.lon]
        bearing: @bearing
        pitch: @pitch
        duration: 150
    , 150 # Duration for setInterval

  componentWillUnmount: ->
    @context.executeAction LocateActions.stopLocationWatch
    if @intervalId
      clearInterval(@intervalId)
      @intervalId = undefined

  render: ->
    <div id="map" className="fullscreen"/>

module.exports = NavigationMap
