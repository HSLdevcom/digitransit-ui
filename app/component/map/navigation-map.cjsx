React         = require 'react'
polyUtil      = require 'polyline-encoded'
getSelector   = require '../../util/get-selector'
geoUtils      = require '../../util/geo-utils'
LocateActions = require '../../action/locate-actions.coffee'


dataAsGeoJSON = (data) ->
  res =
    type: "FeatureCollection"
    features: []

  for leg in data.legs
    res.features.push
      type: "Feature"
      geometry:
        type: "LineString"
        coordinates: ([i[1], i[0]] for i in polyUtil.decode leg.legGeometry.points)
      properties:
        mode: leg.mode.toLowerCase()
  res

locationAsGeoJSON = (coordinates) ->
  type: "FeatureCollection"
  features: [
    type: "Feature"
    geometry:
      type: "Point"
      coordinates: [coordinates.lon, coordinates.lat]
  ]

getLayerForMode = (mode) ->
  id: mode
  type: 'line'
  source: 'route'
  filter: ["==", "mode", mode]
  layout:
    "line-cap": 'round'
  paint:
    "line-width": 3
    "line-color": getSelector(".#{mode}").style?.color or "#999"

getLayerforLocation = ->
  id: 'location'
  type: 'symbol'
  source: 'location'
  layout:
    "icon-allow-overlap": true
    "icon-ignore-placement": true
    "icon-image": "location"

class NavigationMap extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.executeAction LocateActions.startLocationWatch

    require.ensure ['mapbox-gl/dist/mapbox-gl-dev', './mapbox-gl.css'], =>
      require './mapbox-gl.css'
      mapboxgl = require 'mapbox-gl/dist/mapbox-gl-dev'
      coordinates = @context.getStore('LocationStore').getLocationState()
      plan = @context.getStore('ItinerarySearchStore').getData().plan.itineraries[@props.hash]
      map = new mapboxgl.Map
        container: 'map'
        style: '/map/streets-v7.json' # stylesheet location
        center: [coordinates.lat, coordinates.lon]
        zoom: 16
        pitch: 45
        bearing: geoUtils.getBearing(
          plan.legs[0].from.lat,
          plan.legs[0].from.lon,
          plan.legs[0].to.lat,
          plan.legs[0].to.lon)

      mapLoaded = new Promise (resolve) -> map.on 'load', resolve

      Fulltilt = require('exports?window.FULLTILT!fulltilt/dist/fulltilt.js')
      fulltiltLoaded = Fulltilt.getDeviceOrientation(type: 'world')

      mapLoaded.then =>
        #debug("map loaded")
        map.addSource 'route',
          type: "geojson"
          data: dataAsGeoJSON plan
        map.addLayer getLayerForMode(mode) for mode in ["walk", "bus", "tram", "subway", "rail", "ferry"]

        @locationJSONsource = new mapboxgl.GeoJSONSource data: locationAsGeoJSON coordinates
        map.addSource 'location', @locationJSONsource
        map.addLayer getLayerforLocation()

        fulltiltLoaded.then(
          (orientation) => @initializeCompass(map, true, orientation)
        , (errror) => @initializeCompass(map, false)
        )
    , 'mapboxgl'

  initializeCompass: (map, compassAvailable, orientation) ->
    coordinates = @context.getStore('LocationStore').getLocationState()
    @intervalId = setInterval =>
      newCoordinates = @context.getStore('LocationStore').getLocationState()
      if newCoordinates.lon != coordinates.lat or newCoordinates.lon != coordinates.lon
        @locationJSONsource.setData locationAsGeoJSON coordinates
        coordinates = newCoordinates
      if compassAvailable
        euler = orientation.getScreenAdjustedEuler()
      map.easeTo
        center: [coordinates.lat, coordinates.lon]
        bearing: if compassAvailable then 360 - euler.alpha else coordinates.heading or null
        pitch: if compassAvailable and isNaN(euler.beta) then Math.max(euler.beta, 0) else 45
        duration: 150
    , 150

  componentWillUnmount: ->
    @context.executeAction LocateActions.stopLocationWatch
    if @intervalId
      clearInterval(@intervalId)
      @intervalId = undefined

  render: ->
    <div id="map" className="fullscreen"/>

module.exports = NavigationMap
