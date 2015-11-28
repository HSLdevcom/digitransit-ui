React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
isBrowser     = window?
config        = require '../../../config'
StopMarker    = require './stop-marker'
TerminalMarker = require './terminal-marker'
uniq          = require 'lodash/array/uniq'

# Lowest level when stop or terminal markers are rendered
STOPS_MIN_ZOOM = 15

# Highest level when terminals are still rendered instead of individual stops
TERMINAL_STOPS_MAX_ZOOM = 17


class StopMarkerLayer extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  componentDidMount: ->
    @props.map.on 'moveend', @onMapMove
    @onMapMove()

  componentWillUnmount: ->
    @props.map.off 'moveend', @onMapMove

  onMapMove: =>
    if @props.map.getZoom() >= STOPS_MIN_ZOOM
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
      if stop.routes.length == 0
        return
      modeClass = stop.routes[0].type.toLowerCase()
      selected = @props.hilightedStops and stop.gtfsId in @props.hilightedStops

      if stop.parentStation and @props.map.getZoom() <= TERMINAL_STOPS_MAX_ZOOM
        stops.push <TerminalMarker
                          key={stop.parentStation.gtfsId}
                          map={@props.map}
                          terminal={stop.parentStation}
                          selected={selected}
                          mode={modeClass}
                          renderName={true} />
      else
        stops.push <StopMarker key={stop.gtfsId}
                               map={@props.map}
                               stop={stop}
                               selected={selected}
                               mode={modeClass}
                               renderName={stop.name not in renderedNames} />
        renderedNames.push stop.name


    # return without duplicate terminals
    return uniq(stops, 'key')

  render: ->
    <div>{if @props.map.getZoom() >= STOPS_MIN_ZOOM then @getStops() else ""}</div>

module.exports = Relay.createContainer(StopMarkerLayer,
  fragments: queries.StopMarkerLayerFragments
  initialVariables:
    minLat: null
    minLon: null
    maxLat: null
    maxLon: null
    agency: config.preferredAgency
)
