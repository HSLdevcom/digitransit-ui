config = require('../../../config')
React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
{VectorTile}  = require 'vector-tile'
Protobuf      = require 'pbf'
L             = require 'leaflet'
BaseTileLayer = require 'react-leaflet/lib/BaseTileLayer'
omit          = require 'lodash/object/omit'
getSelector   = require '../../../util/get-selector'
Popup         = require '../dynamic-popup'

class SVGTile
  constructor: (@coords, done, @map) ->
    @el = document.createElementNS 'http://www.w3.org/2000/svg', 'svg'
    @el.setAttribute "class", "leaflet-tile"
    @el.setAttribute "viewBox", "0 0 4096 4096"
    @el.addEventListener "click", @onMapClick
    if @coords.z < 14
      return
    fetch("http://localhost:8001/#{@coords.z}/#{@coords.x}/#{@coords.y}.pbf").then (res) =>
      if res.status != 200
        done(null, @el)
        return
      res.arrayBuffer().then (buf) =>
        vt = new VectorTile(new Protobuf(buf))
        @features = [0..vt.layers.geojsonLayer?.length - 1].map (i) => vt.layers.geojsonLayer.feature i
        for i in @features
          @addFeature i
        done(null, @el)
      , (err) -> console.log err

  addFeature: (feature) =>
    unless feature.properties.type
      return
    stop = document.createElementNS 'http://www.w3.org/2000/svg', 'circle'
    geom = feature.loadGeometry()
    stop.setAttribute "cx", geom[0][0].x
    stop.setAttribute "cy", geom[0][0].y
    unless @coords.z <= config.stopsSmallMaxZoom
      halo = document.createElementNS 'http://www.w3.org/2000/svg', 'circle'
      stop.setAttribute "class", feature.properties.type?.toLowerCase() + " stop cursor-pointer"
      stop.setAttribute "r", 72
      stop.setAttribute "stroke-width", 64
      halo.setAttribute "class", "stop-halo cursor-pointer"
      halo.setAttribute "cx", geom[0][0].x
      halo.setAttribute "cy", geom[0][0].y
      halo.setAttribute "r", 128
      halo.setAttribute "stroke-width", 24
      @el.appendChild halo
    else
      stop.setAttribute "class", feature.properties.type?.toLowerCase() + " stop-small cursor-pointer"
      stop.setAttribute "r", 48
      stop.setAttribute "stroke-width", 16
    #circle._feature = feature
    #circle.addEventListener "click", (e) =>
    #  f = e.target._feature.toGeoJSON(@coords.x, @coords.y, @coords.z)
    #  L.popup().setLatLng([f.geometry.coordinates[1], f.geometry.coordinates[0]]).setContent(f.properties.name).openOn(@map)
    @el.appendChild stop

  onMapClick: (e) =>
    L.DomEvent.stopPropagation(e)

    point =
      x: e.offsetX * 16
      y: e.offsetY * 16

    [nearest, dist] = @features.reduce (previous, current) ->
      g = current.loadGeometry()[0][0]
      dist = Math.sqrt((point.x - g.x) ** 2 + (point.y - g.y) ** 2)
      if dist < previous[1]
        [current, dist]
      else
        previous
    , [null, Infinity]

    if dist < 300 #?
      @onStopClicked(nearest.toGeoJSON(@coords.x, @coords.y, @coords.z))
      #popup = L.popup().setLatLng([f.geometry.coordinates[1], f.geometry.coordinates[0]]).setContent(nearest.properties.name).addTo(@map)

class CanvasTile
  constructor: (@coords, done, @map) ->
    @el = document.createElement 'canvas'
    @el.setAttribute "class", "leaflet-tile"
    @el.setAttribute "height", "512"
    @el.setAttribute "width", "512"
    if @coords.z < 14 or !@el.getContext
      return
    fetch("http://172.30.1.194:8001/#{@coords.z}/#{@coords.x}/#{@coords.y}.pbf").then (res) =>
      if res.status != 200
        done(null, @el)
        return
      res.arrayBuffer().then (buf) =>
        vt = new VectorTile(new Protobuf(buf))
        if vt.layers.geojsonLayer
          for i in [0..vt.layers.geojsonLayer.length - 1]
            @addFeature vt.layers.geojsonLayer.feature i
        done(null, @el)
      , (err) -> console.log err

  addFeature: (feature) =>
    unless feature.properties.type
      return
    geom = feature.loadGeometry()
    ctx = @el.getContext '2d'
    ctx.beginPath()
    ctx.fillStyle = getSelector(".#{feature.properties.type?.toLowerCase()}").style.color
    ctx.arc geom[0][0].x / 8, geom[0][0].y / 8, 100 / 8, 0, Math.PI * 2
    ctx.fill()
    ctx.beginPath()
    ctx.fillStyle = '#fff'
    ctx.arc geom[0][0].x / 8, geom[0][0].y / 8, 50 / 8, 0, Math.PI * 2
    ctx.fill()


class StopMarkerTileLayer extends BaseTileLayer
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  createTile: (coords, done) =>
    tile = new SVGTile(coords, done, @props.map)
    tile.onStopClicked = (stop) =>
      console.log stop
      @setState openPopup: stop
    tile.el

  componentWillMount: () ->
    super
    props = omit @props, 'map'
    @leafletElement = new L.GridLayer(props)
    @leafletElement.createTile = @createTile

  componentDidUpdate: ->
    @refs.popup?._leafletElement.openOn(@props.map)

  render: () ->
    console.log JSON.stringify @state?.openPopup
    if @state?.openPopup
      <Popup options={
        offset: [106, 3]
        closeButton: false
        maxWidth: 250
        minWidth: 250
        className: "popup"}
        latlng={L.latLng [@state.openPopup.geometry.coordinates[1], @state.openPopup.geometry.coordinates[0]]}
        ref="popup">
        <div>ASDFASDF</div>
      </Popup>
    else
      null


module.exports = StopMarkerTileLayer
