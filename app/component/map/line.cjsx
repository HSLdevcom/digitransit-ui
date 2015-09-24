isBrowser          = window?
React              = require 'react'
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null

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

  render: ->
    className = @props.mode + if @props.thin then " thin" else ""
    objs = []
    objs.push <Polyline map={@props.map}
                        key="halo"
                        ref="halo"
                        positions={@props.geometry}
                        className={"leg-halo #{className}"}
                        weight={if @props.thin then 4 else 5}
                        interactive={false} />
    objs.push <Polyline map={@props.map}
                        key="line"
                        ref="line"
                        positions={@props.geometry}
                        className="leg #{className}"
                        weight={if @props.thin then 2 else 3}
                        interactive={false} />

    <div style={{display: "none"}}>{objs}</div>

module.exports = Line
