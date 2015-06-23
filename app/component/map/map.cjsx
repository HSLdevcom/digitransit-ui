isBrowser     = window?
React         = require 'react'
Icon          = require '../icon/icon'
StopMarkerContainer = require './stop-marker-container'
#VehicleMarkerContainer = require './vehicle-marker-container'
LeafletMap    = if isBrowser then require 'react-leaflet/lib/Map' else null
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
TileLayer     = if isBrowser then require 'react-leaflet/lib/TileLayer' else null
L             = if isBrowser then require 'leaflet' else null
merge         = require 'merge'
config        = require '../../config'

if isBrowser
  require 'leaflet/dist/leaflet.css'

class Map extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    router: React.PropTypes.func

  @currentLocationIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-location-animated')), className: 'current-location-marker') else null

  constructor: ->
    super
    coordinates = @context.getStore('LocationStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      @state =
        location: [coordinates.lat, coordinates.lon]
        zoom: 16
        hasLocation: true
    else
      @state =
        location: [60.17332, 24.94102]
        zoom: 11
        hasLocation: false

  setBounds: (props) ->
    if typeof props.from == 'string'
      if props.from.indexOf('::') != -1
        from = props.from.split('::')[1].split(',')
      else
        from = props.from.split(',')
    else
      from = props.from
    if typeof props.to == 'string'
      if props.to.indexOf('::') != -1
        to = props.to.split('::')[1].split(',')
      else
        to = props.to.split(',')
    else
      to = props.to

    @refs.map.getLeafletElement().fitBounds [from, to], paddingTopLeft: props.padding

  componentDidMount: ->
    @context.getStore('LocationStore').addChangeListener @onLocationChange
    @onLocationChange()
    L.control.attribution(position: 'bottomleft', prefix: false).addTo @refs.map.getLeafletElement()
    if @props.fitBounds
      @setBounds(@props)

  componentWillUpdate: (newProps) ->
    if newProps.fitBounds and (newProps.from != @props.from or newProps.to != @props.to)
      @setBounds(newProps)

  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onLocationChange

  onLocationChange: =>
    coordinates = @context.getStore('LocationStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      if !@props.fitBounds
        @setState
          location: [coordinates.lat, coordinates.lon]
          zoom: 16
          hasLocation: true
      else
        @setState
          hasLocation: true

  updateQuery: =>
      center = @refs.map.getLeafletElement().getCenter()
      #@context.router.replaceWith(
      #    @context.router.getCurrentPathname(),
      #    @context.router.getCurrentParams(),
      #    merge(@context.router.getCurrentQuery(),
      #          zoom: @refs.map.getLeafletElement().getZoom()
      #          lon: center.lng
      #          lat: center.lat))

  render: ->
    if isBrowser
      if @state.hasLocation == true
        marker = <Marker
          position={@state.location}
          icon={Map.currentLocationIcon}/>

      stops = if @props.showStops then <StopMarkerContainer hilightedStops={@props.hilightedStops}/> else ""
      vehicles = ""#if @props.showVehicles then <VehicleMarkerContainer/> else ""

      map =
        <LeafletMap
          ref='map'
          center={[@context.router.getCurrentQuery().lat or @props.lat or @state.location[0]+0.0005,
                   @context.router.getCurrentQuery().lon or @props.lon or @state.location[1]]}
          zoom={@context.router.getCurrentQuery().zoom or @props.zoom or @state.zoom}
          zoomControl={not L.Browser.touch}
          attributionControl=false
          onLeafletDragend=@updateQuery
          onLeafletZoomend=@updateQuery
          >
          <TileLayer
            url={config.URL.MAP + "{z}/{x}/{y}{size}.png"}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            size={if L.Browser.retina then "@2x" else  ""}
          />
          {stops}
          {vehicles}
          {marker}
          {@props.leafletObjs}
        </LeafletMap>


    <div className={"map " + if @props.className then @props.className else ""}>
      {map}
      <div className="background-gradient"></div>
      {@props.children}
    </div>

module.exports = Map
