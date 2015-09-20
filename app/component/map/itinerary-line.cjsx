React              = require 'react'
ReactDOM           = require 'react-dom/server'
isBrowser          = window?
StopMarker         = require './stop-marker'
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
L                  = if isBrowser then require 'leaflet' else null
Icon               = require '../icon/icon'
polyUtil           = require 'polyline-encoded'


class ItineraryLine extends React.Component

  @fromIcon: if isBrowser then L.divIcon(html: ReactDOM.renderToStaticMarkup(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'from', iconAnchor: [12,24]) else null
  @toIcon: if isBrowser then L.divIcon(html: ReactDOM.renderToStaticMarkup(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'to', iconAnchor: [12,24]) else null

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
                          key={i + leg.mode + @props.passive + "line"}
                          positions={polyUtil.decode leg.legGeometry.points}
                          className="leg #{modeClass}"
                          weight=3 />
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
                              mode={modeClass}
                              renderText={leg.transitLeg and @props.showTransferLabels}/>

    <div style={{display: "none"}}>{objs}</div>

module.exports = ItineraryLine
