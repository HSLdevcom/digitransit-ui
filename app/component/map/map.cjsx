isBrowser     = window?
React         = require 'react'
Icon          = require '../icon/icon'
LeafletMap    = if isBrowser then require 'react-leaflet/lib/Map' else null
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
TileLayer     = if isBrowser then require 'react-leaflet/lib/TileLayer' else null
L             = if isBrowser then require 'leaflet' else null
LocationStore = require '../../store/location-store'

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
    @context.getStore(LocationStore).addChangeListener @onLocationChange
    @onLocationChange()
    L.control.attribution(position: 'bottomleft', prefix: false).addTo @refs.map.getLeafletElement()


  componentWillUnmount: ->
    @context.getStore(LocationStore).removeChangeListener @onLocationChange

  onLocationChange: =>
    coordinates = @context.getStore(LocationStore).getLocationState()
    if (coordinates.lat != 0 || coordinates.lon != 0)
      @setState
        location: [coordinates.lat, coordinates.lon]
        zoom: 15
        hasLocation: true

  render: ->
    if isBrowser
      if @state.hasLocation == true
        marker = <Marker
          position={@state.location}
          icon={Map.currentLocationIcon}/>

      map =
        <LeafletMap 
          ref='map'
          center={[@state.location[0]+0.001, @state.location[1]]}
          zoom={@state.zoom}
          zoomControl=false
          attributionControl=false>
          <TileLayer
            url="http://matka.hsl.fi/hsl-map/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OSM</a>'
          />
          {marker}
          {@props.leafletObjs}
        </LeafletMap>

    <div className={"map " + if @props.className then @props.className else ""}>
      {map}
      <div className="background-gradient"></div>
      {@props.children}
    </div>

module.exports = Map