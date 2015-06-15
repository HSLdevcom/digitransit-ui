React              = require 'react'
isBrowser          = window?
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
L                  = if isBrowser then require 'leaflet' else null
DynamicPopup       = if isBrowser then require './dynamic-popup' else null
StopMarkerPopup    = require './stop-marker-popup'
Icon               = require '../icon/icon'
polyUtil           = require 'polyline-encoded'
getSelector        = require '../../util/get-selector'

class RouteLine extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @fromIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'from', iconAnchor: [12,24]) else null
  @toIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'to', iconAnchor: [12,24]) else null

  render: ->
    objs = []
    color = if isBrowser then getSelector("." + @props.mode).style?.color else "#999" # TODO: Need a better way to do this
    objs.push <Marker map={@props.map} key="from" position={@props.stops[0]} icon={RouteLine.fromIcon}/>
    objs.push <Marker map={@props.map} key="to" position={@props.stops[@props.stops.length-1]} icon={RouteLine.toIcon}/>
    objs.push <Polyline map={@props.map} key={"halo"} positions={polyUtil.decode @props.geometry.points} color="#fff" opacity=1 weight=5 />
    objs.push <Polyline map={@props.map} key={"line"} positions={polyUtil.decode @props.geometry.points} color={color} opacity=1 weight=3 />
    @props.stops.forEach (stop, i) =>
      popup = 
        <DynamicPopup options={{offset: [106, 3], closeButton:false, maxWidth:250, minWidth:250, className:"stop-marker-popup"}}>
          <StopMarkerPopup stop={stop} context={@context}/>
        </DynamicPopup>
      objs.push <CircleMarker map={@props.map} key={i + "circleHalo"} center={lat: stop.lat, lng: stop.lon} radius=3 color="#fff" opacity=1 >{popup}</CircleMarker>
      objs.push <CircleMarker map={@props.map} key={i + "circle"} center={lat: stop.lat, lng: stop.lon} radius=2 color={color} fill={color} opacity=1 fillOpacity=1 clickable={false}/>
    
    <div style={{display: "none"}}>{objs}</div>

module.exports = RouteLine