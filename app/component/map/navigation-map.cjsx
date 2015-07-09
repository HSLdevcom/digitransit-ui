React         = require 'react'
polyUtil      = require 'polyline-encoded'
getSelector   = require '../../util/get-selector'
geoUtils      = require '../../util/geo-utils'

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


class NavigationMap extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    require.ensure ['mapbox-gl/dist/mapbox-gl', './mapbox-gl.css'], =>
      require './mapbox-gl.css'
      mapboxgl = require 'mapbox-gl/dist/mapbox-gl'
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

      map.on 'load', ->
        map.addSource 'route',
          type: "geojson"
          data: geoJSON

        map.addLayer getLayerForMode(mode) for mode in ["walk", "bus", "tram", "subway", "rail", "ferry"]

        map.easeTo({duration:2000, pitch:45, zoom:16.75, bearing: bearing})

        compassAvailable = false
        Fulltilt.getDeviceOrientation(type: 'world').then((orientation) ->
          console.log "compass set up"
          compassAvailable = true
          setInterval ->
            euler = orientation.getScreenAdjustedEuler()
            map.easeTo
              bearing: 360 - euler.alpha
              pitch: if isNaN(euler.beta) then 45 else Math.max(euler.beta, 0)
              duration: 150
          , 150
        , (err) -> console.log "Compass not available: #{err}")
    , 'mapboxgl'

  render: ->
    <div id="map" className="fullscreen"/>

module.exports = NavigationMap
