React              = require 'react'
isBrowser          = window?
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
L                  = if isBrowser then require 'leaflet' else null
DynamicPopup       = if isBrowser then require './dynamic-popup' else null
StopMarkerPopup    = require './stop-marker-popup'
Icon               = require '../icon/icon'

class RouteLine extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired


  @fromIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'from', iconAnchor: [12,24]) else null
  @toIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'to', iconAnchor: [12,24]) else null

  render: ->
    objs = []
    modeClass = @props.mode.toLowerCase()
    objs.push <Marker map={@props.map} key="from" position={@props.stops[0]} icon={RouteLine.fromIcon}/>
    objs.push <Marker map={@props.map} key="to" position={@props.stops[@props.stops.length-1]} icon={RouteLine.toIcon}/>
    objs.push <Polyline map={@props.map}
                        key={"halo"}
                        positions={@props.geometry}
                        className="leg-halo #{modeClass}"
                        weight=5
                        interactive={false} />
    objs.push <Polyline map={@props.map}
                        key={"line"}
                        positions={@props.geometry}
                        className="leg #{modeClass}"
                        weight=3
                        interactive={false} />
    @props.stops.forEach (stop, i) =>
     # This is copied to stop-marker-container.cjsx. Remember to change both at the same time
     # to retain visual consistency.
     popup =
        <DynamicPopup options={{offset: [106, 3], closeButton:false, maxWidth:250, minWidth:250, className:"stop-marker-popup"}}>
          <StopMarkerPopup stop={stop} context={@context}/>
        </DynamicPopup>
     objs.push <CircleMarker map={@props.map}
                             key={i + "circleHalo"}
                             center={lat: stop.lat, lng: stop.lon}
                             className="stop-on-line-halo #{modeClass}"
                             radius=3 >
        {popup}
     </CircleMarker>
     objs.push <CircleMarker map={@props.map}
                             key={i + "circle"}
                             center={lat: stop.lat, lng: stop.lon}
                             className="stop-on-line #{modeClass}"
                             radius=2
                             interactive={false} />

    <div style={{display: "none"}}>{objs}</div>

module.exports = RouteLine
