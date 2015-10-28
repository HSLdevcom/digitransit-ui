React         = require 'react'
geoUtils      = require '../../util/geo-utils'
PositionActions = require '../../action/position-actions.coffee'
RealTimeClient = require '../../action/real-time-client-action'
RealTimeInformationAction = require '../../action/real-time-client-action'

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
        require('promise?global,mapboxgl!./mapbox-gl-style')(),
        require('promise?global,mapboxgl!exports?window.FULLTILT!fulltilt/dist/fulltilt.js')()
      ]

  componentDidMount: ->
    @requirePromise.then ([mapboxgl, mapboxcss, mapStyle, Fulltilt]) =>
      coordinates = @context.getStore('PositionStore').getLocationState()
      plan = @context.getStore('ItinerarySearchStore').getData().plan.itineraries[@props.hash]
      @bearing = geoUtils.getBearing(
        plan.legs[0].from.lat, plan.legs[0].from.lon, plan.legs[0].to.lat, plan.legs[0].to.lon)
      map = new mapboxgl.Map(
        container: 'map'
        style: mapStyle
        center: [coordinates.lon, coordinates.lat]
        zoom: 16
        pitch: 45
        bearing: @bearing
      )

      # Store map. We will have to remove it when component will unmount
      @map = map

      mapLoaded = new Promise((resolve) -> map.on 'load', resolve)

      fulltiltLoaded = Fulltilt.getDeviceOrientation(type: 'world')

      mapLoaded.then =>
        map.addSource 'route',
          type: "geojson"
          data: geoUtils.dataAsGeoJSON plan

        for mode in ["walk", "bus", "tram", "subway", "rail", "ferry"]
          map.addLayer geoUtils.getLayerForMode mode

        @locationJSONsource = new mapboxgl.GeoJSONSource(
          data: geoUtils.locationAsGeoJSON coordinates
        )

        map.addSource 'location', @locationJSONsource
        map.addLayer geoUtils.getLayerforLocation()

        @context.executeAction(
          RealTimeInformationAction.startRealTimeClient,
          geoUtils.getTopicsForPlan plan
        )

        vehiclesJSONsource = new mapboxgl.GeoJSONSource(
          data: geoUtils.vehiclesAsGeoJson @context.getStore("RealTimeInformationStore").vehicles
        )

        map.addSource 'vehicles', vehiclesJSONsource
        map.addLayer geoUtils.getLayerForVehicles()

        @vehicleIntervalId = setInterval =>
          vehiclesJSONsource.setData(
            geoUtils.vehiclesAsGeoJson @context.getStore("RealTimeInformationStore").vehicles
          )
        , 1000 # Update vehicle locations each second

        fulltiltLoaded.then(
          (orientation) => @initializeCompass(map, true, orientation)
        , (errror) => @initializeCompass(map, false)
        )



  initializeCompass: (map, compassAvailable, orientation) ->
    coordinates = @context.getStore('PositionStore').getLocationState()
    @intervalId = setInterval =>
      newCoordinates = @context.getStore('PositionStore').getLocationState()

      if newCoordinates.lon != coordinates.lat or newCoordinates.lon != coordinates.lon
        @locationJSONsource.setData geoUtils.locationAsGeoJSON coordinates

      if compassAvailable
        euler = orientation.getScreenAdjustedEuler()
        bearing = 360 - euler.alpha
        # Check that pitch could be calculated and that it is not negative
        pitch = if !isNaN(euler.beta) then Math.max(euler.beta, 0) else 45
      else
        heading = coordinates.heading
        # Bearing might not be availabe from the GPS, then use the previous value
        bearing = if heading or heading == 0 then heading else @bearing
        pitch = 45

      if (newCoordinates.lon != coordinates.lat or newCoordinates.lon != coordinates.lon or
          bearing != @bearing or pitch != @pitch)
        map.easeTo
          center: [coordinates.lon, coordinates.lat]
          bearing: bearing
          pitch: pitch
          duration: 150
        coordinates = newCoordinates
        @bearing = bearing
        @pitch = pitch
    , 150 # Duration for setInterval

  componentWillUnmount: ->
    @context.executeAction PositionActions.stopLocationWatch
    if @intervalId
      clearInterval(@intervalId)
      @intervalId = undefined

    if @vehicleIntervalId
      clearInterval(@vehicleIntervalId)
      @vehicleIntervalId = undefined

    client = @context.getStore('RealTimeInformationStore').client
    if client
      @context.executeAction RealTimeClient.stopRealTimeClient, client

    # Clear all Map resources
    @map.remove()

  render: ->
    <div id="map" className="fullscreen"/>

module.exports = NavigationMap
