React         = require 'react'
ReactDOM      = require 'react-dom/server'
isBrowser     = window?
Marker        = if isBrowser then require 'react-leaflet/lib/Marker' else null
Popup        = if isBrowser then require 'react-leaflet/lib/Popup' else null
L             = if isBrowser then require 'leaflet' else null
StopMarkerPopup = require './stop-marker-popup'

STOPS_MAX_ZOOM = 14


class StopMarker extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  @iconSvg: ReactDOM.renderToStaticMarkup <svg viewBox="0 0 18 18">
      <circle key="halo" className="stop-halo" cx="9" cy="9" r="8" strokeWidth="1"/>
      <circle key="stop" className="stop" cx="9" cy="9" r="4.5" strokeWidth="4"/>
    </svg>

  # A slightly bigger icon to be showed on stop page map for the selected stop
  @selectedIconSvg: ReactDOM.renderToStaticMarkup <svg viewBox="0 0 28 28">
      <circle key="halo" className="stop-halo" cx="14" cy="14" r="13" strokeWidth="1"/>
      <circle key="stop" className="stop" cx="14" cy="14" r="8" strokeWidth="7"/>
    </svg>

  @getStopIcon: (mode, selected) ->
    L.divIcon
      html: if selected then StopMarker.selectedIconSvg else StopMarker.iconSvg
      iconSize: if selected then [28, 28] else [18, 18]
      className: mode

  componentDidMount: ->
    @props.map.on 'zoomend', @onMapMove
    @onMapMove()

  componentWillUnmount: ->
    @props.map.off 'zoomend', @onMapMove

  onMapMove: =>
    @forceUpdate()

  getStopMarker: ->
    <Marker key="stop"
            map={@props.map}
            key={@props.stop.gtfsId}
            position={lat: @props.stop.lat, lng: @props.stop.lon}
            icon={StopMarker.getStopIcon @props.mode, @props.selected}>
       <Popup options={
         offset: [106, 3]
         closeButton:false
         maxWidth:250
         minWidth:250
         className:"stop-marker-popup"}>
         <StopMarkerPopup stop={@props.stop} context={@context}/>
       </Popup>
    </Marker>

  getStopNameMarker: ->
    unless @props.renderName
      return false
    <Marker map={@props.map}
            key={@props.stop.name + "_text"}
            position={lat: @props.stop.lat, lng: @props.stop.lon}
            interactive={false}
            icon={L.divIcon
              html: ReactDOM.renderToStaticMarkup(<div>{@props.stop.name}</div>)
              className: 'stop-name-marker'
              iconSize: [150, 0]
              iconAnchor: [-10, 10]}
            />

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getStopMarker()}
      {@getStopNameMarker()}
    </div>

module.exports = StopMarker
