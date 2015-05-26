isBrowser     = window?
React         = require 'react'
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

  @currentLocationIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-location-animated')), className: 'current-location-marker') else null

  constructor: -> 
    super
    @state =
      location: [60.17332, 24.94102]
      zoom: 11
      hasLocation: false

  componentDidMount: -> 
    @context.getStore('LocationStore').addChangeListener @onLocationChange
    @onLocationChange()
    L.control.attribution(position: 'bottomleft', prefix: false).addTo @refs.map.getLeafletElement()


  componentWillUnmount: ->
    @context.getStore('LocationStore').removeChangeListener @onLocationChange

  onLocationChange: =>
    coordinates = @context.getStore('LocationStore').getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      @setState
        location: [coordinates.lat, coordinates.lon]
        zoom: 16
        hasLocation: true

  render: ->
    if isBrowser
      if @state.hasLocation == true
        marker = <Marker
          position={@state.location}
          icon={Map.currentLocationIcon}/>

      stops = if @props.showStops then <StopMarkerContainer/> else ""
      vehicles = ""#if @props.showVehicles then <VehicleMarkerContainer/> else ""

      map =
        <LeafletMap 
          ref='map'
          center={@props.center or [@state.location[0]+0.0005, @state.location[1]]}
          zoom={@props.zoom or @state.zoom}
          zoomControl=false
          attributionControl=false>
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