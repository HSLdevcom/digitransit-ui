isBrowser      = window?
React          = require 'react'
Relay          = require 'react-relay'
queries        =  require '../../queries'
Icon           = require '../icon/icon'
LocationMarker = require './location-marker'
config         = require '../../config'
OriginPopup    = require './origin-popup'
LeafletMap     = if isBrowser then require('react-leaflet/lib/Map').default else null
TileLayer      = if isBrowser then require('react-leaflet/lib/TileLayer').default else null
L              = if isBrowser then require 'leaflet' else null
PositionMarker = require './position-marker'
PlaceMarker    = require './place-marker'
{boundWithMinimumArea} = require '../../util/geo-utils'

if isBrowser and config.map.useVectorTiles
  TileLayerContainer = require './tile-layer/tile-layer-container'
  Stops              = require './tile-layer/stops'
  CityBikes          = require './tile-layer/city-bikes'

else
  StopMarkerContainer = if isBrowser then require './non-tile-layer/stop-marker-container'
  CityBikeMarkerContainer = if isBrowser then require './non-tile-layer/city-bike-marker-container'

#VehicleMarkerContainer = require './vehicle-marker-container'

{startMeasuring, stopMeasuring} = require '../../util/jankmeter'

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
    displayOriginPopup: React.PropTypes.bool

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    piwik: React.PropTypes.object

  componentDidMount: =>
    #TODO: need to use prefix, as for some reason attributions aren't updated when layer is added
    #TODO: also react-leaflet is not compatible with leaflet 1.0, so we can't use attributionControl which works correctly
    L.control.attribution(
      position: 'bottomleft'
      prefix: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
    ).addTo @refs.map.getLeafletElement()
    if not @props.disableZoom or L.Browser.touch
      L.control.zoom(position: 'topleft').addTo @refs.map.getLeafletElement()

  startMeasuring: =>
    startMeasuring()

  stopMeasuring: =>
    results = stopMeasuring()

    # The leaflet event seems to fire at load without the start event
    if !results
      return

    # Piwik doesn't show event values, if they are too long, so we must round... >_<
    @context.piwik?.trackEvent('perf', 'map-drag', 'min', Math.round(results.min))
    @context.piwik?.trackEvent('perf', 'map-drag', 'max', Math.round(results.max))
    @context.piwik?.trackEvent('perf', 'map-drag', 'avg', Math.round(results.avg))

  render: =>
    if isBrowser
      leafletObjs = @props.leafletObjs or []

      if config.map.useVectorTiles
        layers = []
        if @props.showStops
          layers.push Stops
          if config.cityBike.showCityBikes
            layers.push CityBikes
        leafletObjs.push <TileLayerContainer
          key='tileLayer'
          layers={layers}
          tileSize={config.map.tileSize or 256}
          zoomOffset={config.map.zoomOffset or 0}
          disableMapTracking={@props.disableMapTracking}
          />

      else
        if @props.showStops
          leafletObjs.push <StopMarkerContainer
            key='stops'
            hilightedStops={@props.hilightedStops}
            disableMapTracking={@props.disableMapTracking}
            updateWhenIdle={false}/>
          if config.cityBike.showCityBikes
            leafletObjs.push <CityBikeMarkerContainer key="cityBikes"/>

      # vehicles = null #if @props.showVehicles then <VehicleMarkerContainer/> else ""

      origin = @context.getStore('EndpointStore').getOrigin()

      if origin?.lat
        #TODO: Why have two markers?
        leafletObjs.push <LocationMarker position={origin} className="from" key='from'/>
        leafletObjs.push <PlaceMarker position={origin} key='from2'/>

      if @props.displayOriginPopup
        leafletObjs.push <OriginPopup key='origin'/>


      leafletObjs.push <PositionMarker key='position'/>

      center =
        if not @props.fitBounds and @props.lat and @props.lon
          [@props.lat, @props.lon]

      zoom = @props.zoom
      bounds = boundWithMinimumArea @props.from, @props.to
      boundsOptions = if @props.padding then paddingTopLeft: @props.padding

      map =
        <LeafletMap
          ref='map'
          center={center}
          zoom={zoom}
          zoomControl={false}
          attributionControl={false}
          bounds={if @props.fitBounds then bounds}
          animate={true}
          {... @props.leafletOptions}
          boundsOptions={boundsOptions}
          {... @props.leafletEvents}
          >
          <TileLayer
            url={config.URL.MAP + "{z}/{x}/{y}{size}.png"}
            tileSize={config.map.tileSize or 256}
            zoomOffset={config.map.zoomOffset or 0}
            updateWhenIdle={false}
            size={if config.map?.useRetinaTiles and L.Browser.retina then "@2x" else  ""}/>
          {leafletObjs}
        </LeafletMap>
    <div className={"map " + if @props.className then @props.className else ""}>
      {map}
      <div className="background-gradient"></div>
      {@props.children}
    </div>

module.exports = Map
