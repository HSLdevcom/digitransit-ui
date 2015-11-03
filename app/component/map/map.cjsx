isBrowser     = window?
React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../queries'
Icon          = require '../icon/icon'
LocationMarker = require './location-marker'
StopMarkerContainer = require './stop-marker-container'
#VehicleMarkerContainer = require './vehicle-marker-container'
LeafletMap    = if isBrowser then require 'react-leaflet/lib/Map' else null
TileLayer     = if isBrowser then require 'react-leaflet/lib/TileLayer' else null
L             = if isBrowser then require 'leaflet' else null
config        = require '../../config'
PositionMarker = require './position-marker'

if isBrowser
  require 'leaflet/dist/leaflet.css'

class Map extends React.Component

  @propTypes: #todo not complete
    fitBounds: React.PropTypes.bool
    center:    React.PropTypes.bool
    from:      React.PropTypes.object
    to:        React.PropTypes.object
    padding:   React.PropTypes.number
    zoom:      React.PropTypes.number

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  getLocation: ->
    coordinates = @context.getStore('PositionStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      hasPosition: true
    else
      hasPosition: false

  setBounds: (props) ->
    @refs.map.getLeafletElement().fitBounds(
      [props.from, props.to],
      paddingTopLeft: props.padding)

  componentDidMount: =>
    @context.getStore('EndpointStore').addChangeListener @onChange
    L.control.attribution(position: 'bottomleft', prefix: false).addTo @refs.map.getLeafletElement()
    if @props.disableMapTracking
      @refs.map.getLeafletElement().addEventListener('dragstart', @props.disableMapTracking)
      @refs.map.getLeafletElement().addEventListener('zoomend', @props.disableMapTracking)
    if not @props.disableZoom or L.Browser.touch
      L.control.zoom(position: 'topleft').addTo @refs.map.getLeafletElement()
    if @props.fitBounds
      @setBounds(@props)

  componentWillUpdate: (newProps) ->
    if newProps.fitBounds and (newProps.from != @props.from or newProps.to != @props.to)
      @setBounds(newProps)

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onPositionChange
    @context.getStore('EndpointStore').removeChangeListener @onChange

  onChange: (endPointChange) =>
    if endPointChange in ['set-origin']
      origin = @context.getStore('EndpointStore').getOrigin()
      @refs.map.getLeafletElement().setView([origin.lat, origin.lon])
    @forceUpdate()

  render: =>
    if isBrowser
      origin = @context.getStore('EndpointStore').getOrigin()
      location = @getLocation()

      if origin?.lat
        fromMarker = <LocationMarker position={origin} className="from"/>

      positionMarker = <PositionMarker/>

      if @props.showStops
        stops = <StopMarkerContainer hilightedStops={@props.hilightedStops}/>

      vehicles = ""#if @props.showVehicles then <VehicleMarkerContainer/> else ""

      center =
        if @props.fitBounds
          undefined #fitBounds is used instead
        else if @props.lat and @props.lon
          [@props.lat, @props.lon]
        else if origin.lat and origin.lon
          [origin.lat, origin.lon]  #origin is used
        else
          undefined # no center to use

      zoom =
        if @props.fitBounds
          undefined
        else if @props.zoom
          @props.zoom
        else
          undefined

      map =
        <LeafletMap
          ref='map'
          center={center}
          zoom={zoom}
          zoomControl={false}
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
