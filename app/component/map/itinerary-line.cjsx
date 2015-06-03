React              = require 'react'
isBrowser          = window?
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
FeatureGroup       = if isBrowser then require 'react-leaflet/lib/FeatureGroup' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
L                  = if isBrowser then require 'leaflet' else null
Icon               = require '../icon/icon'
polyUtil           = require 'polyline-encoded'
getSelector        = require '../../util/get-selector'

class ItineraryLine extends React.Component

  @fromIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'from') else null
  @toIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'to') else null

  render: ->
    objs = []
    if @props.showFromToMarkers
      objs.push <Marker map={@props.map} key="from" position={@props.legs[0].from} icon={ItineraryLine.fromIcon}/>
      objs.push <Marker map={@props.map} key="to" position={@props.legs[@props.legs.length-1].to} icon={ItineraryLine.toIcon}/>
    for leg, i in @props.legs
      color = if isBrowser then getSelector("." + leg.mode).style?.color else "#999" # TODO: Need a better way to do this
      objs.push <Polyline map={@props.map} key={i + leg.mode + "halo"} positions={polyUtil.decode leg.legGeometry.points} color="#fff" opacity=1 weight=5 />
      objs.push <Polyline map={@props.map} key={i + leg.mode} positions={polyUtil.decode leg.legGeometry.points} color={color or "#999"} opacity=1 weight=3 />
      objs.push <CircleMarker map={@props.map} key={i + "," + j + leg.mode + "circleHalo"} center={lat: leg.from.lat, lng: leg.from.lon} radius=3 color="#fff" opacity=1 />
      objs.push <CircleMarker map={@props.map} key={i + "," + j + leg.mode + "circle"} center={lat: leg.from.lat, lng: leg.from.lon} radius=2 color={color or "#999"} fill={color or "#999"} opacity=1 fillOpacity=1 />
      if leg.transitLeg and @props.showTransferLabels
        objs.push <Marker map={@props.map}
                           key={i + "_text"}
                           position={lat: leg.from.lat, lng: leg.from.lon}
                           icon={if isBrowser then L.divIcon(html: React.renderToString(React.createElement('div',{},leg.from.name)), className: 'stop-name-marker ' + leg.mode.toLowerCase(), iconSize: [150, 0], iconAnchor: [-10, 10]) else null}
                           clickable={false}/>


    <div style={{display: "none"}}>{objs}</div>

module.exports = ItineraryLine