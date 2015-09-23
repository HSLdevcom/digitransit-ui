React              = require 'react'
isBrowser          = window?
StopMarker         = require './stop-marker'
LocationMarker     = require './location-marker'
Line               = require './line'
polyUtil           = require 'polyline-encoded'

class ItineraryLine extends React.Component
  render: ->
    if not isBrowser
      return false
    objs = []
    if @props.showFromToMarkers
      objs.push <LocationMarker map=@props.map
                                position={@props.legs[0].from}
                                class='from' />
      objs.push <LocationMarker map=@props.map
                                position={@props.legs[@props.legs.length-1].to}
                                class='to' />

    for leg, i in @props.legs
      mode = if @props.passive then "passive" else leg.mode.toLowerCase()
      objs.push <Line map={@props.map}
                      key={i + leg.mode + @props.passive}
                      geometry={polyUtil.decode leg.legGeometry.points}
                      mode={mode} />
      if not @props.passive
        objs.push <StopMarker map={@props.map}
                              key={i + "," + leg.mode + "marker"}
                              stop={
                                lat: leg.from.lat
                                lon: leg.from.lon
                                name: leg.from.name
                                gtfsId: leg.from.stopId
                                code: leg.from.stopCode
                              }
                              mode={mode}
                              renderText={leg.transitLeg and @props.showTransferLabels}/>

    <div style={{display: "none"}}>{objs}</div>

module.exports = ItineraryLine
