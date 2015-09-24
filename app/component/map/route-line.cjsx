React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
ReactDOM           = require 'react-dom/server'
isBrowser          = window?
StopMarker         = require './stop-marker'
LocationMarker     = require './location-marker'
Line               = require './line'

class RouteLine extends React.Component
  render: ->
    if not isBrowser
      return false

    objs = []
    modeClass = @props.route.route.type.toLowerCase()

    unless @props.thin
      # We are drawing a background line under an itinerary line,
      # so we don't want many markers cluttering the map
      objs.push <LocationMarker map=@props.map
                                position={@props.route.stops[0]}
                                class='from' />
      objs.push <LocationMarker map=@props.map
                                position={@props.route.stops[@props.route.stops.length-1]}
                                class='to' />

    objs.push <Line map={@props.map}
                    geometry={@props.route.geometry or @props.route.stops}
                    mode={modeClass}
                    thin={@props.thin} />

    @props.route.stops.forEach (stop) =>
      if @props.filteredStops
        gtfsIds = @props.filteredStops.map((stop) -> stop.stopId)
        if gtfsIds.indexOf(stop.gtfsId) != -1
          return
      objs.push <StopMarker map={@props.map}
                            stop={stop}
                            key={stop.gtfsId}
                            mode={modeClass}
                            thin={@props.thin} />

    <div style={{display: "none"}}>{objs}</div>

module.exports = Relay.createContainer(RouteLine, fragments: queries.RouteLineFragments)
