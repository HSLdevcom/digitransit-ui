isBrowser          = window?
React              = require 'react'
Polyline           = if isBrowser then require('react-leaflet/lib/Polyline').default else null
cx                 = require 'classnames'
config             = require '../../config'

class Line extends React.Component
  componentDidMount: () =>
    if @props.thin
      # If we accidently draw the thin line over a normal one,
      # the halo will block it completely and we only see the thin one.
      # So we send the thin line layers (Leaflet calls every polyline its
      # own layer) to bottom. Note that all polylines do render inside the
      # same SVG, so CSS z-index can't be used.
      @refs.line.getLeafletElement().bringToBack()
      @refs.halo.getLeafletElement().bringToBack()

  componentDidUpdate: () =>
    unless @props.passive and @props.thin
      @refs.line.getLeafletElement().bringToFront()

  render: ->
    className = cx [@props.mode,
      thin: @props.thin
    ]

    # https://github.com/Leaflet/Leaflet/issues/2662
    # updating className does not work currently :(

    objs = []
    haloWeight = if @props.thin then config.map.line.halo.thinWeight else config.map.line.halo.weight
    legWeight = if @props.thin then config.map.line.leg.thinWeight else config.map.line.leg.weight

    objs.push <Polyline map={@props.map}
                        layerContainer={@props.layerContainer}
                        key="halo"
                        ref="halo"
                        positions={@props.geometry}
                        className={"leg-halo #{className}"}
                        weight={haloWeight}
                        interactive={false} />
    objs.push <Polyline map={@props.map}
                        layerContainer={@props.layerContainer}
                        key="line"
                        ref="line"
                        positions={@props.geometry}
                        className="leg #{className}"
                        color={if @props.passive then "#c2c2c2" else "currentColor"}
                        weight={legWeight}
                        interactive={false} />

    <div style={{display: "none"}}>{objs}</div>

module.exports = Line
