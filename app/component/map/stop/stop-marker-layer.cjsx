config = require('../../../config')
React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
isBrowser     = window?
config        = require '../../../config'
StopMarker    = require './stop-marker'
TerminalMarker = require './terminal-marker'
uniq          = require 'lodash/array/uniq'


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
    @props.map.on 'click', @onMapClick

  componentWillUnmount: ->
    @props.map.off 'moveend', @onMapMove
    @props.map.off 'click', @onMapClick

  onMapMove: =>
    if @props.map.getZoom() >= config.stopsMinZoom
      bounds = @props.map.getBounds()
      @props.relay.setVariables
        minLat: bounds.getSouth()
        minLon: bounds.getWest()
        maxLat: bounds.getNorth()
        maxLon: bounds.getEast()
    else
      @forceUpdate()

  onMapClick: (e) =>
    score = Infinity
    closest = null
    for _, s of @refs
      stop = s.props.stop or s.props.terminal
      distance = e.layerPoint.distanceTo @props.map.latLngToLayerPoint [stop.lat, stop.lon]
      if distance < score
        score = distance
        closest = stop.gtfsId

    if score < 20 # if distance less than 20 pixels
      @refs[closest].openPopup()

  getStops: ->
    stops = []
    renderedNames = []
    @props.stopsInRectangle.stopsByBbox.forEach (stop) =>
      if stop.routes.length == 0
        return
      modeClass = stop.routes[0].type.toLowerCase()
      selected = @props.hilightedStops and stop.gtfsId in @props.hilightedStops

      if stop.parentStation and @props.map.getZoom() <= config.terminalStopsMaxZoom
        stops.push <TerminalMarker
                          key={stop.parentStation.gtfsId}
                          ref={stop.parentStation.gtfsId}
                          map={@props.map}
                          terminal={stop.parentStation}
                          selected={selected}
                          mode={modeClass}
                          renderName={false} />
      else
        stops.push <StopMarker key={stop.gtfsId}
                               ref={stop.gtfsId}
                               map={@props.map}
                               stop={stop}
                               selected={selected}
                               mode={modeClass}
                               renderName={stop.name not in renderedNames} />
        renderedNames.push stop.name


    # return without duplicate terminals
    return uniq(stops, 'key')

  render: ->
    <div>{if @props.map.getZoom() >= config.stopsMinZoom then @getStops() else ""}</div>

module.exports = Relay.createContainer(StopMarkerLayer,
  fragments: queries.StopMarkerLayerFragments
  initialVariables:
    minLat: null
    minLon: null
    maxLat: null
    maxLon: null
    agency: config.preferredAgency
)
