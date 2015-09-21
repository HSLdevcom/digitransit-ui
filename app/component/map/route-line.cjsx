React              = require 'react'
ReactDOM           = require 'react-dom/server'
isBrowser          = window?
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
L                  = if isBrowser then require 'leaflet' else null
StopMarker         = require './stop-marker'
Icon               = require '../icon/icon'

class RouteLine extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired


  @fromIcon: if isBrowser then L.divIcon(html: ReactDOM.renderToStaticMarkup(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'from', iconAnchor: [12,24]) else null
  @toIcon: if isBrowser then L.divIcon(html: ReactDOM.renderToStaticMarkup(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'to', iconAnchor: [12,24]) else null

  render: ->
    objs = []
    modeClass = @props.mode.toLowerCase()
    geometry = @props.geometry or @props.stops
    objs.push <Marker map={@props.map} key="from" position={@props.stops[0]} icon={RouteLine.fromIcon}/>
    objs.push <Marker map={@props.map} key="to" position={@props.stops[@props.stops.length-1]} icon={RouteLine.toIcon}/>
    objs.push <Polyline map={@props.map}
                        key={"halo"}
                        positions={geometry}
                        className="leg-halo #{modeClass}"
                        weight=5
                        interactive={false} />
    objs.push <Polyline map={@props.map}
                        key={"line"}
                        positions={geometry}
                        className="leg #{modeClass}"
                        weight=3
                        interactive={false} />
    @props.stops.forEach (stop) =>
      objs.push <StopMarker map={@props.map}
                            stop={stop}
                            key={stop.gtfsId}
                            mode={modeClass}/>

    <div style={{display: "none"}}>{objs}</div>

module.exports = RouteLine
