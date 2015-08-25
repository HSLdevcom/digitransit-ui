React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../queries'
isBrowser     = window?
DynamicPopup  = if isBrowser then require './dynamic-popup' else null
CircleMarker  = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
StopMarkerPopup = require './stop-marker-popup'
NearestStopsAction = require '../../action/nearest-stops-action'
L             = if isBrowser then require 'leaflet' else null
config        = require '../../config'

STOPS_MAX_ZOOM = 14

class StopMarkerContainer extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  componentDidMount: ->
    @props.map.on 'moveend', @onMapMove
    @onMapMove()

  componentWillUnmount: ->
    @props.map.off 'moveend', @onMapMove

  onMapMove: =>
    if STOPS_MAX_ZOOM < @props.map.getZoom()
      bounds = @props.map.getBounds()
      @props.relay.setVariables
        minLat: bounds.getSouth()
        minLon: bounds.getWest()
        maxLat: bounds.getNorth()
        maxLon: bounds.getEast()
    else
      @forceUpdate()

  getStops: ->
    stops = []
    renderedNames = []
    @props.stopsInRectangle.stopsByBbox.forEach (stop) =>
      modeClass = stop.routes[0].type.toLowerCase()
      selected = @props.hilightedStops and stop.gtfsId in @props.hilightedStops
      # This is copied to route-line.cjsx. Remember to change both at the same time
      # to retain visual consistency.
      #https://github.com/codebusters/react-leaflet/commit/c7b897e3ef429774323c7d8130f2fae504779b1a
      popup =
        <DynamicPopup options={{offset: [106, 3], closeButton:false, maxWidth:250, minWidth:250, className:"stop-marker-popup"}}>
          <StopMarkerPopup stop={stop} context={@context}/>
        </DynamicPopup>

      stops.push <CircleMarker map={@props.map}
                               key={stop.gtfsId + "outline"}
                               center={lat: stop.lat, lng: stop.lon}
                               className="#{modeClass} stop-halo"
                               radius={if selected then 13 else 8}
                               weight=1 >
        {popup}
      </CircleMarker>
      stops.push <CircleMarker map={@props.map}
                               key={stop.gtfsId}
                               center={lat: stop.lat, lng: stop.lon}
                               className="#{modeClass} stop"
                               radius={if selected then 8 else 4.5}
                               weight={if selected then 7 else 4}
                               interactive={false} />
                               # when the CircleMarker is not clickable, the click goes to element behind it (the bigger marker)
      unless stop.name in renderedNames
        stops.push <Marker map={@props.map}
                           key={stop.name + "_text"}
                           position={lat: stop.lat, lng: stop.lon}
                           icon={if isBrowser then L.divIcon(html: React.renderToString(React.createElement('div',{},stop.name)), className: 'stop-name-marker', iconSize: [150, 0], iconAnchor: [-10, 10]) else null}
                           interactive={false}/>
        renderedNames.push stop.name

    stops

  render: ->
    <div>{if STOPS_MAX_ZOOM < @props.map.getZoom() then @getStops() else ""}</div>

module.exports = Relay.createContainer(StopMarkerContainer,
  fragments: queries.StopMarkerContainerFragments
  initialVariables: # Ugly hack, not my fault https://github.com/facebook/relay/issues/97
    minLat: 0.1
    minLon: 0.1
    maxLat: 0.1
    maxLon: 0.1
    agency: config.preferredAgency
)
