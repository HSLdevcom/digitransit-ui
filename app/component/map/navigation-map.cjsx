React         = require 'react'
polyUtil      = require 'polyline-encoded'


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
        mode: leg.mode

  res

_toRad = (deg) -> deg * Math.PI / 180
_toDeg = (rad) -> rad * 180 / Math.PI

getBearing = (lat1,lng1,lat2,lng2) ->
  lonScale = Math.cos _toRad (lat1+lat2)/2
  dx = lat2-lat1
  dy = (lng2-lng1)/lonScale
  (90 - _toDeg(Math.atan2(dx, dy))) % 360

class NavigationMap extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    require.ensure ['mapbox-gl/dist/mapbox-gl', './mapbox-gl.css'], =>
      require './mapbox-gl.css'
      mapboxgl = require 'mapbox-gl/dist/mapbox-gl'
      mapboxgl.accessToken = 'pk.eyJ1IjoiaGFubmVzIiwiYSI6IjE0MTU1YjdhZWJiYWVmZjM4YWYwOTkyMGM3OTg2OTRmIn0.s9O-s9fl2HKP-f63axyqig';
      coordinates = @context.getStore('LocationStore').getLocationState()
      map = new mapboxgl.Map
        container: 'map'
        style: '/map/streets-v7.json' # stylesheet location
        center: [coordinates.lat, coordinates.lon]
        zoom: 15

      orientationEvents = false;

      plan = @context.getStore('ItinerarySearchStore').getData().plan.itineraries[@props.hash]

      geoJSON = dataAsGeoJSON plan

      bearing = getBearing plan.legs[0].from.lat, plan.legs[0].from.lon, plan.legs[0].to.lat, plan.legs[0].to.lon

      map.on 'load', ->
        map.addSource 'route',
          type: "geojson"
          data: geoJSON
        map.addLayer
          id: 'base'
          type: 'line'
          source: 'route'
          layout:
            "line-cap": 'round'
          paint:
            "line-width": 4
            "line-color": "#fff"
        map.addLayer
          id: 'walk'
          type: 'line'
          source: 'route'
          filter: ["==", "mode", "WALK"]
          layout:
            "line-cap": 'round'
          paint:
            "line-width": 3
            "line-color": "#999"
        map.addLayer
          id: 'bus'
          type: 'line'
          source: 'route'
          filter: ["==", "mode", "BUS"]
          layout:
            "line-cap": 'round'
          paint:
            "line-width": 3
            "line-color": "#007ac9"
        map.addLayer
          id: 'tram'
          type: 'line'
          source: 'route'
          filter: ["==", "mode", "TRAM"]
          layout:
            "line-cap": 'round'
          paint:
            "line-width": 3
            "line-color": "#00985f"
        map.addLayer
          id: 'subway'
          type: 'line'
          source: 'route'
          filter: ["==", "mode", "SUBWAY"]
          layout:
            "line-cap": 'round'
          paint:
            "line-width": 3
            "line-color": "#ff6319"
        map.addLayer
          id: 'rail'
          type: 'line'
          source: 'route'
          filter: ["==", "mode", "RAIL"]
          layout:
            "line-cap": 'round'
          paint:
            "line-width": 3
            "line-color": "#8c4799"
        map.addLayer
          id: 'ferry'
          type: 'line'
          source: 'route'
          filter: ["==", "mode", "FERRY"]
          layout:
            "line-cap": 'round'
          paint:
            "line-width": 3
            "line-color": "#00b9e4"

        map.easeTo({duration:2000, pitch:45, zoom:16.75, bearing: bearing})

      #     navigator.geolocation.watchPosition (position) ->
      #       bearing = if (isNaN(position.coords.heading) || orientationEvents) then undefined else position.coords.heading
      #       map.jumpTo({center: [position.coords.latitude, position.coords.longitude]})
      #     , console.log, {enableHighAccuracy: true}
      #     window.addEventListener 'deviceorientation', (eventData) ->
      #       if(eventData.webkitCompassHeading)
      #         compassdir = eventData.webkitCompassHeading
      #       else
      #         compassdir = eventData.alpha
      #       map.easeTo
      #         bearing: compassdir
      #         pitch: if isNaN(eventData.beta) then 60 else Math.max(eventData.beta, 0)
      #         duration: 100
      #       orientationEvents = true

    , 'mapboxgl'

  render: ->
    <div id="map" className="fullscreen"/>

module.exports = NavigationMap
