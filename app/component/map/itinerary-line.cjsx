React              = require 'react'
isBrowser          = window?
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
FeatureGroup       = if isBrowser then require 'react-leaflet/lib/FeatureGroup' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
L                  = if isBrowser then require 'leaflet' else null
Icon               = require '../icon/icon'
polyUtil           = require 'polyline-encoded'

class ItineraryLine extends React.Component

  @fromIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'from', iconAnchor: [12,24]) else null
  @toIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'to', iconAnchor: [12,24]) else null

  render: ->
    objs = []
    if @props.showFromToMarkers
      objs.push <Marker map={@props.map} key="from" position={@props.legs[0].from} icon={ItineraryLine.fromIcon}/>
      objs.push <Marker map={@props.map} key="to" position={@props.legs[@props.legs.length-1].to} icon={ItineraryLine.toIcon}/>
    for leg, i in @props.legs
      modeClass = if @props.passive then "passive" else leg.mode.toLowerCase()
      objs.push <Polyline map={@props.map}
                          key={i + leg.mode + @props.passive + "halo"}
                          positions={polyUtil.decode leg.legGeometry.points}
                          className="leg-halo #{modeClass}"
                          weight=5 />
      objs.push <Polyline map={@props.map}
                          key={i + leg.mode + @props.passive}
                          positions={polyUtil.decode leg.legGeometry.points}
                          className="leg #{modeClass}"
                          weight=3 />
      if not @props.passive
        objs.push <CircleMarker map={@props.map}
                                key={i + "," + leg.mode + @props.passive + "circleHalo"}
                                center={lat: leg.from.lat, lng: leg.from.lon}
                                className="stop-on-line-halo #{modeClass}"
                                radius=3 />
        objs.push <CircleMarker map={@props.map}
                                key={i + "," + leg.mode + @props.passive + "circle"}
                                center={lat: leg.from.lat, lng: leg.from.lon}
                                className="stop-on-line #{modeClass}"
                                radius=2 />

      if leg.transitLeg and @props.showTransferLabels
        objs.push <Marker map={@props.map}
                           key={i + "_text"}
                           position={lat: leg.from.lat, lng: leg.from.lon}
                           icon={if isBrowser then L.divIcon(html: React.renderToString(React.createElement('div',{},leg.from.name)), className: 'stop-name-marker ' + modeClass, iconSize: [150, 0], iconAnchor: [-10, 10]) else null}
                           clickable={false}/>

    <div style={{display: "none"}}>{objs}</div>

module.exports = ItineraryLine