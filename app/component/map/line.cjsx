isBrowser          = window?
React              = require 'react'
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null

class Line extends React.Component
  render: ->
    objs = []
    objs.push <Polyline map={@props.map}
                        key={"halo"}
                        positions={@props.geometry}
                        className="leg-halo #{@props.mode}"
                        weight=5
                        interactive={false} />
    objs.push <Polyline map={@props.map}
                        key={"line"}
                        positions={@props.geometry}
                        className="leg #{@props.mode}"
                        weight=3
                        interactive={false} />

    <div style={{display: "none"}}>{objs}</div>

module.exports = Line
