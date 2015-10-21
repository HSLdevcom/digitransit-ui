isBrowser     = window?
React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../queries'
Icon          = require '../icon/icon'
LocationMarker = require './location-marker'
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
      L.divIcon
        html: Icon.asString 'icon-icon_mapMarker-location-animated'
        className: 'current-location-marker'
    else
      null

  getLocation: ->
    coordinates = @context.getStore('LocationStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      coordinates: [coordinates.lat, coordinates.lon]
      zoom: 16
      hasPosition: true
    else
      coordinates: [60.17332, 24.94102]
      zoom: 11
      hasPosition: false

  setBounds: (props) ->
    @refs.map.getLeafletElement().fitBounds(
      [props.from, props.to],
      paddingTopLeft: props.padding)

  componentDidMount: ->
    @context.getStore('LocationStore').addChangeListener @onChange
    @context.getStore('EndpointStore').addChangeListener @onChange
    L.control.attribution(position: 'bottomleft', prefix: false).addTo @refs.map.getLeafletElement()
    if @props.fitBounds
      @setBounds(@props)

  componentWillUpdate: (newProps) ->
    if newProps.fitBounds and (newProps.from != @props.from or newProps.to != @props.to)
      @setBounds(newProps)

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onChange
    @context.getStore('EndpointStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    if isBrowser
      origin = @context.getStore('EndpointStore').getOrigin()
      location = @getLocation()

      if origin?.lat
        fromMarker = <LocationMarker position={origin} className="from"/>

      if location.hasPosition == true
        positionMarker = <Marker position={location.coordinates} icon={Map.currentLocationIcon}/>

      if @props.showStops
        stops = <StopMarkerContainer hilightedStops={@props.hilightedStops}/>

      vehicles = ""#if @props.showVehicles then <VehicleMarkerContainer/> else ""

      map =
        <LeafletMap
          ref='map'
          center={unless @props.fitBounds then [
                   @props.lat or origin.lat or location.coordinates[0] + 0.0005,
                   @props.lon or origin.lon or location.coordinates[1]]}
          zoom={unless @props.fitBounds then @props.zoom or location.zoom}
          zoomControl={not (@props.disableZoom or L.Browser.touch)}
          attributionControl=false
          >
          <TileLayer
            url={config.URL.MAP + "{z}/{x}/{y}{size}.png"}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            size={if L.Browser.retina then "@2x" else  ""}/>
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
