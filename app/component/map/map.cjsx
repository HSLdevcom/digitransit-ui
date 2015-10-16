isBrowser     = window?
React         = require 'react'
ReactDOM      = require 'react-dom/server'
Relay         = require 'react-relay'
queries       = require '../../queries'
Icon          = require '../icon/icon'
StopMarkerContainer = require './stop-marker-container'
#VehicleMarkerContainer = require './vehicle-marker-container'
LeafletMap    = if isBrowser then require 'react-leaflet/lib/Map' else null
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
TileLayer     = if isBrowser then require 'react-leaflet/lib/TileLayer' else null
L             = if isBrowser then require 'leaflet' else null
config        = require '../../config'

if isBrowser
  require 'leaflet/dist/leaflet.css'

class Map extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @currentLocationIcon:
    if isBrowser
      L.divIcon(
        html: ReactDOM.renderToStaticMarkup(
          React.createElement(
            Icon, img: 'icon-icon_mapMarker-location-animated')),
        className: 'current-location-marker')
    else
      null

  @fromIcon:
    if isBrowser
      L.divIcon(
        html: ReactDOM.renderToStaticMarkup(
          React.createElement(
            Icon, img: 'icon-icon_mapMarker-point')),
        className: 'from', iconAnchor: [12, 24])
    else
      null

  constructor: ->
    super
    coordinates = @context.getStore('LocationStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      @state =
        position: [coordinates.lat, coordinates.lon]
        zoom: 16
        hasPosition: true
        origin: {lat: null, lon: null}
    else
      @state =
        position: [60.17332, 24.94102]
        zoom: 11
        hasPosition: false
        origin: {lat: null, lon: null}

  setBounds: (props) ->
    @refs.map.getLeafletElement().fitBounds(
      [props.from, props.to],
      paddingTopLeft: props.padding)

  componentDidMount: ->
    @context.getStore('LocationStore').addChangeListener @onLocationChange
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange
    @onLocationChange()
    L.control.attribution(position: 'bottomleft', prefix: false).addTo @refs.map.getLeafletElement()
    if @props.fitBounds
      @setBounds(@props)

  componentWillUpdate: (newProps) ->
    if newProps.fitBounds and (newProps.from != @props.from or newProps.to != @props.to)
      @setBounds(newProps)

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onLocationChange
    @context.getStore('LocationStore').removeChangeListener @onEndpointChange

  onLocationChange: =>
    coordinates = @context.getStore('LocationStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      if !@props.fitBounds
        @setState
          position: [coordinates.lat, coordinates.lon]
          zoom: 16
          hasPosition: true
      else
        @setState
          hasPosition: true

  onEndpointChange: =>
    @setState
      origin: @context.getStore('EndpointStore').getOrigin()

  render: ->
    if isBrowser
      if @state.origin.lat
        fromMarker = <Marker
          position={[@state.origin.lat, @state.origin.lon]}
          icon={Map.fromIcon}/>
      if @state.hasPosition == true
        positionMarker = <Marker
          position={@state.position}
          icon={Map.currentLocationIcon}/>

      if @props.showStops
        stops = <StopMarkerContainer hilightedStops={@props.hilightedStops}/>

      vehicles = ""#if @props.showVehicles then <VehicleMarkerContainer/> else ""

      map =
        <LeafletMap
          ref='map'
          center={unless @props.fitBounds then [
                   @props.lat or @state.origin.lat or @state.position[0] + 0.0005,
                   @props.lon or @state.origin.lon or @state.position[1]]}
          zoom={unless @props.fitBounds then @props.zoom or @state.zoom}
          zoomControl={not (@props.disableZoom or L.Browser.touch)}
          attributionControl=false
          >
          <TileLayer
            url={config.URL.MAP + "{z}/{x}/{y}{size}.png"}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            size={if L.Browser.retina then "@2x" else  ""}
          />
          {stops}
          {vehicles}
          {fromMarker}
          {positionMarker}
          {@props.leafletObjs}
        </LeafletMap>


    <div className={"map " + if @props.className then @props.className else ""}>
      {map}
      <div className="background-gradient"></div>
      {@props.children}
    </div>

module.exports = Map
