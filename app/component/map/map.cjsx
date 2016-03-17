isBrowser     = window?
React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../queries'
Icon          = require '../icon/icon'
LocationMarker = require './location-marker'
config        = require '../../config'

StopMarkerContainer = if isBrowser and config.URL.STOP_MAP
                        require './stop/stop-marker-tile-layer'
                      else if !config.URL.STOP_MAP
                        require './stop/stop-marker-container'
                      else null

CityBikeMarkerContainer = require './city-bike/city-bike-marker-container'
#VehicleMarkerContainer = require './vehicle-marker-container'
LeafletMap    = if isBrowser then require('react-leaflet/lib/Map').default else null
TileLayer     = if isBrowser then require('react-leaflet/lib/TileLayer').default else null
L             = if isBrowser then require 'leaflet' else null
PositionMarker = require './position-marker'
PlaceMarker = require './place-marker'

if isBrowser
  require 'leaflet/dist/leaflet.css'

class Map extends React.Component

  @propTypes: #todo not complete
    fitBounds: React.PropTypes.bool
    center: React.PropTypes.bool
    from: React.PropTypes.array
    to: React.PropTypes.array
    padding: React.PropTypes.array
    zoom: React.PropTypes.number
    leafletEvents: React.PropTypes.object
    leafletOptions: React.PropTypes.object

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: =>
    #TODO: need to use prefix, as for some reason attributions aren't updated when layer is added
    #TODO: also react-leaflet is not compatible with leaflet 1.0, so we can't use attributionControl which works correctly
    L.control.attribution(
      position: 'bottomleft'
      prefix: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
    ).addTo @refs.map.getLeafletElement()
    if not @props.disableZoom or L.Browser.touch
      L.control.zoom(position: 'topleft').addTo @refs.map.getLeafletElement()

  render: =>
    if isBrowser
      origin = @context.getStore('EndpointStore').getOrigin()

      if origin?.lat
        fromMarker = <LocationMarker position={origin} className="from"/>
        placeMarker = <PlaceMarker position={origin}/>

      positionMarker = <PositionMarker/>

      if @props.showStops
        stops = <StopMarkerContainer
          hilightedStops={@props.hilightedStops}
          disableMapTracking={@props.disableMapTracking}
          tileSize={config.map.tileSize or 256}
          zoomOffset={config.map.zoomOffset or 0}
          updateWhenIdle={false}/>
        cityBikes = if config.cityBike.showCityBikes then <CityBikeMarkerContainer/> else null

      vehicles = ""#if @props.showVehicles then <VehicleMarkerContainer/> else ""

      center =
        if @props.fitBounds
          undefined #fitBounds is used instead
        else if @props.lat and @props.lon
          [@props.lat, @props.lon]

      zoom = if not @props.fitBounds and @props.zoom then @props.zoom

      map =
        <LeafletMap
          ref='map'
          center={center}
          zoom={zoom}
          zoomControl={false}
          attributionControl={false}
          bounds={if @props.fitBounds then [@props.from, @props.to]}
          {... @props.leafletOptions}
          boundsOptions={if @props.fitBounds then paddingTopLeft: @props.padding}
          {... @props.leafletEvents}
          >
          <TileLayer
            url={config.URL.MAP + "{z}/{x}/{y}{size}.png"}
            tileSize={config.map.tileSize or 256}
            zoomOffset={config.map.zoomOffset or 0}
            updateWhenIdle={false}
            size={if config.map?.useRetinaTiles and L.Browser.retina then "@2x" else  ""}/>
          {stops}
          {vehicles}
          {fromMarker}
          {positionMarker}
          {placeMarker}
          {cityBikes}
          {@props.leafletObjs}
        </LeafletMap>


    <div className={"map " + if @props.className then @props.className else ""}>
      {map}
      <div className="background-gradient"></div>
      {@props.children}
    </div>

module.exports = Map
