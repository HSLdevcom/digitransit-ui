React              = require 'react'
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
    modeClass = @props.mode.toLowerCase()

    objs.push <LocationMarker map=@props.map
                              position={@props.stops[0]}
                              class='from' />
    objs.push <LocationMarker map=@props.map
                              position={@props.stops[@props.stops.length-1]}
                              class='to' />
    objs.push <Line map={@props.map}
                    geometry={@props.geometry or @props.stops}
                    mode={modeClass} />

    @props.stops.forEach (stop) =>
      objs.push <StopMarker map={@props.map}
                            stop={stop}
                            key={stop.gtfsId}
                            mode={modeClass}/>

    <div style={{display: "none"}}>{objs}</div>

module.exports = RouteLine
