config = require('../../../config')
React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
{VectorTile}  = require 'vector-tile'
Protobuf      = require 'pbf'
L             = require 'leaflet'
BaseTileLayer = require('react-leaflet/lib/BaseTileLayer').default
omit          = require 'lodash/omit'
getSelector   = require '../../../util/get-selector'
Popup         = require '../dynamic-popup'
StopMarkerPopup = require './stop-marker-popup'
StopMarkerSelectPopup = require './stop-marker-select-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'

class SVGTile
  constructor: (@coords, done, @props) ->
    @extent = 4096
    @tileSize = (@props.tileSize or 256)
    @ratio = @extent / @tileSize

    @el = L.SVG.create 'svg'
    @el.setAttribute "class", "leaflet-tile"
    @el.setAttribute "viewBox", "0 0 #{@tileSize} #{@tileSize}"
    @el.addEventListener "click", @onMapClick
    if @coords.z < config.stopsMinZoom
      return
    fetch("#{config.URL.STOP_MAP}#{@coords.z + (@props.zoomOffset or 0)}/#{@coords.x}/#{@coords.y}.pbf").then (res) =>
      if res.status != 200
        done null, @el
        return
      res.arrayBuffer().then (buf) =>
        vt = new VectorTile(new Protobuf(buf))
        @features = [0..vt.layers.stops?.length - 1]
          .map((i) -> vt.layers.stops.feature i)
          .filter((feature) -> feature.properties.type)
        for i in @features
          @addFeature i
        done null, @el
      , (err) -> console.log err

  addFeature: (feature) =>
    stop = L.SVG.create 'circle'
    geom = feature.loadGeometry()
    stop.setAttribute "cx", geom[0][0].x / @ratio
    stop.setAttribute "cy", geom[0][0].y / @ratio
    unless @coords.z <= config.stopsSmallMaxZoom
      halo = L.SVG.create 'circle'
      stop.setAttribute "class", feature.properties.type?.toLowerCase() + " stop cursor-pointer"
      stop.setAttribute "r", 4.5
      stop.setAttribute "stroke-width", 4
      halo.setAttribute "class", "stop-halo cursor-pointer"
      halo.setAttribute "cx", geom[0][0].x / @ratio
      halo.setAttribute "cy", geom[0][0].y / @ratio
      halo.setAttribute "r", 8
      halo.setAttribute "stroke-width", 1.5
      @el.appendChild halo
    else
      stop.setAttribute "class", feature.properties.type?.toLowerCase() + " stop-small cursor-pointer"
      stop.setAttribute "r", 3
      stop.setAttribute "stroke-width", 1
    @el.appendChild stop

  onMapClick: (e) =>
    if @features

      point =
        x: e.offsetX
        y: e.offsetY

      nearest = @features.filter (stop) =>
        g = stop.loadGeometry()[0][0]
        dist = Math.sqrt((point.x - (g.x / @ratio)) ** 2 + (point.y - (g.y / @ratio)) ** 2)
        if dist < 17 then true else false

      if nearest.length == 0
        @onStopClicked false
      else if nearest.length == 1
        L.DomEvent.stopPropagation e
        coords = nearest[0].toGeoJSON(@coords.x, @coords.y, @coords.z + (@props.zoomOffset or 0)).geometry.coordinates
        @onStopClicked nearest, L.latLng [coords[1], coords[0]]
      else
        L.DomEvent.stopPropagation e
        @onStopClicked nearest, @props.map.mouseEventToLatLng e


class StopMarkerTileLayer extends BaseTileLayer
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  createTile: (coords, done) =>
    tile = new SVGTile(coords, done, @props)
    tile.onStopClicked = (stops, coords) =>
      if @props.disableMapTracking
        @props.disableMapTracking()
      @setState
        stops: stops
        coords: coords
    tile.el

  componentWillMount: () ->
    super
    props = omit @props, 'map'
    @leafletElement = new L.GridLayer(props)
    @leafletElement.createTile = @createTile

  componentDidUpdate: ->
    @refs.popup?._leafletElement.openOn(@props.map)

  render: () ->
    StopMarkerPopupWithContext = provideContext StopMarkerPopup,
      intl: intl.intlShape.isRequired
      history: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    StopMarkerSelectPopupWithContext = provideContext StopMarkerSelectPopup,
      intl: intl.intlShape.isRequired
      history: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    #TODO: cjsx doesn't like objects withing nested elements
    loadingPopupStyle = {"height": 150}

    if @state?.stops.length == 1
      <Popup options={
        offset: [106, 3]
        closeButton: false
        maxWidth: 250
        minWidth: 250
        autoPanPaddingTopLeft: [5, 125]
        className: "popup"}
        latlng={@state.coords}
        ref="popup">
        <Relay.RootContainer
          Component={StopMarkerPopup}
          route={new queries.StopRoute(
            stopId: @state.stops[0].properties.gtfsId
            date: @context.getStore('TimeStore').getCurrentTime().format("YYYYMMDD")
          )}
          renderLoading={() => <div className="card" style=loadingPopupStyle><div className="spinner-loader small"/></div>}
          renderFetched={(data) => <StopMarkerPopupWithContext {... data} context={@context}/>}/>
      </Popup>
    else if @state?.stops.length > 1
      <Popup options={
        offset: [106, 3]
        closeButton: false
        maxWidth: 250
        minWidth: 250
        maxHeight: 220
        autoPanPaddingTopLeft: [5, 125]
        className: "popup"}
        latlng={@state.coords}
        ref="popup">
        <StopMarkerSelectPopupWithContext options={@state.stops} context={@context}/>
      </Popup>
    else
      null


module.exports = StopMarkerTileLayer
