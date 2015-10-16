React         = require 'react'
ReactDOM      = require 'react-dom/server'
Relay         = require 'react-relay'
queries       = require '../../queries'
isBrowser     = window?
Marker        = if isBrowser then require 'react-leaflet/lib/Marker'
Popup         = if isBrowser then require './dynamic-popup'
#Popup        = if isBrowser then require 'react-leaflet/lib/Popup'
L             = if isBrowser then require 'leaflet'
StopMarkerPopup = require './stop-marker-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'


STOPS_SMALL_MAX_ZOOM = 15

iconSvg = ReactDOM.renderToStaticMarkup <svg viewBox="0 0 18 18">
    <circle key="halo" className="stop-halo" cx="9" cy="9" r="8" strokeWidth="1"/>
    <circle key="stop" className="stop" cx="9" cy="9" r="4.5" strokeWidth="4"/>
  </svg>

# A slightly bigger icon to be showed on stop page map for the selected stop
selectedIconSvg = ReactDOM.renderToStaticMarkup <svg viewBox="0 0 28 28">
    <circle key="halo" className="stop-halo" cx="14" cy="14" r="13" strokeWidth="1"/>
    <circle key="stop" className="stop" cx="14" cy="14" r="8" strokeWidth="7"/>
  </svg>

# Small icon for zoom levels <= 15
smallIconSvg = ReactDOM.renderToStaticMarkup <svg viewBox="0 0 8 8">
    <circle className="stop-small" cx="4" cy="4" r="3" strokeWidth="1"/>
  </svg>

class StopMarker extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  @getStopIcon: (mode, selected, zoom) ->
    L.divIcon
      html: if zoom <= STOPS_SMALL_MAX_ZOOM then smallIconSvg else if selected then selectedIconSvg else iconSvg
      iconSize: if zoom <= STOPS_SMALL_MAX_ZOOM then [8, 8] else if selected then [28, 28] else [18, 18]
      className: mode + ' cursor-pointer'

  componentDidMount: ->
    @props.map.on 'zoomend', @onMapMove
    @onMapMove()

  componentWillUnmount: ->
    @props.map.off 'zoomend', @onMapMove

  onMapMove: =>
    @forceUpdate()

  getStopMarker: ->
    StopMarkerPopupWithContext = provideContext StopMarkerPopup,
      intl: intl.intlShape.isRequired
      history: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    <Marker map={@props.map}
            position={lat: @props.stop.lat, lng: @props.stop.lon}
            icon={StopMarker.getStopIcon(
                    @props.mode + (if @props.thin then " thin" else ""),
                    @props.selected,
                    @props.map.getZoom())}>
       <Popup options={
         offset: [106, 3]
         closeButton: false
         maxWidth: 250
         minWidth: 250
         className: "popup"}>
         <Relay.RootContainer
           Component={StopMarkerPopup}
           route={new queries.StopRoute(stopId: @props.stop.gtfsId)}
           renderFetched={(data) => <StopMarkerPopupWithContext stop={data.stop} context={@context}/>}
         />
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
              className: 'popup stop-name-marker'
              iconSize: [150, 0]
              iconAnchor: [-8, 7]}
    />

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getStopMarker()}
      {@getStopNameMarker()}
    </div>

module.exports = StopMarker
