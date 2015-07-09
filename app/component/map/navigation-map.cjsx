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
      Fulltilt = require('exports?window.FULLTILT!fulltilt/dist/fulltilt.js')
      coordinates = @context.getStore('LocationStore').getLocationState()
      map = new mapboxgl.Map
        container: 'map'
        style: '/map/streets-v7.json' # stylesheet location
        center: [coordinates.lat, coordinates.lon]
        zoom: 15

      plan = @context.getStore('ItinerarySearchStore').getData().plan.itineraries[@props.hash]
      geoJSON = dataAsGeoJSON plan
      bearing = geoUtils.getBearing plan.legs[0].from.lat, plan.legs[0].from.lon, plan.legs[0].to.lat, plan.legs[0].to.lon

      locationJSONsource = new mapboxgl.GeoJSONSource data: locationAsGeoJSON coordinates

      map.on 'load', ->
        map.addSource 'route',
          type: "geojson"
          data: geoJSON

        map.addLayer getLayerForMode(mode) for mode in ["walk", "bus", "tram", "subway", "rail", "ferry"]

        map.addSource 'location', locationJSONsource
        map.addLayer getLayerforLocation()

        map.easeTo({duration:2000, pitch:45, zoom:16.75, bearing: bearing})

        compassAvailable = false
        Fulltilt.getDeviceOrientation(type: 'world').then((orientation) ->
          console.log "compass set up"
          compassAvailable = true
          setInterval ->
            newCoordinates = @context.getStore('LocationStore').getLocationState()
            if newCoordinates.lon != coordinates.lat or newCoordinates.lon != coordinates.lon
              locationJSONsource.setData locationAsGeoJSON coordinates
              coordinates = newCoordinates
            euler = orientation.getScreenAdjustedEuler()
            map.easeTo
              center: [coordinates.lat, coordinates.lon]
              bearing: 360 - euler.alpha
              pitch: if isNaN(euler.beta) then 45 else Math.max(euler.beta, 0)
              duration: 150
          , 150
        , (err) ->
          console.log "Compass not available: #{err}")
          setInterval ->
            newCoordinates = @context.getStore('LocationStore').getLocationState()
            if newCoordinates.lon != coordinates.lat or newCoordinates.lon != coordinates.lon
              locationJSONsource.setData locationAsGeoJSON coordinates
              coordinates = newCoordinates
            euler = orientation.getScreenAdjustedEuler()
            map.easeTo
              center: [coordinates.lat, coordinates.lon]
              bearing: coordinates.heading or null
              pitch: 45
              duration: 150
    , 'mapboxgl'

  componentWillUnmount: ->
    @context.executeAction LocateActions.stopLocationWatch

  render: ->
    <div id="map" className="fullscreen"/>

module.exports = NavigationMap
