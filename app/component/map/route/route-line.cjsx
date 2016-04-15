React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../../queries'
isBrowser          = window?
StopMarker         = require '../non-tile-layer/stop-marker'
LocationMarker     = require '../location-marker'
Line               = require '../line'

class RouteLine extends React.Component
  render: ->
    unless isBrowser
      return false

    unless @props.pattern
      return <div style={display: "none"}/>

    objs = []
    modeClass = @props.pattern.route.type.toLowerCase()

    unless @props.thin
      # We are drawing a background line under an itinerary line,
      # so we don't want many markers cluttering the map
      objs.push <LocationMarker map=@props.map
                                key="from"
                                position={@props.pattern.stops[0]}
                                className='from' />
      objs.push <LocationMarker map=@props.map
                                key="to"
                                position={@props.pattern.stops[@props.pattern.stops.length - 1]}
                                className='to' />

    line = <Line map={@props.map}
                 key="line"
                 geometry={@props.pattern.geometry or @props.pattern.stops}
                 mode={modeClass}
                 thin={@props.thin} />

    filteredIds = @props.filteredStops?.map((stop) -> stop.stopId) or []

    markers = @props.pattern?.stops.map (stop) =>
      if stop.gtfsId in filteredIds
        return

      <StopMarker map={@props.map}
                  stop={stop}
                  key={stop.gtfsId}
                  mode={modeClass + if @props.thin then " thin" else ""}
                  thin={@props.thin} />

    <div style={display: "none"}>{objs}{line}{markers}</div>

module.exports = Relay.createContainer(RouteLine, fragments: queries.RouteLineFragments)
