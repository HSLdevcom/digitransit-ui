React         = require 'react'
isBrowser     = window?
Marker        = if isBrowser then require 'react-leaflet/lib/Marker'
Popup         = if isBrowser then require './dynamic-popup'
#Popup        = if isBrowser then require 'react-leaflet/lib/Popup'
L             = if isBrowser then require 'leaflet'
CityBikePopup = require './city-bike-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'
Icon          = require '../icon/icon'


STOPS_SMALL_MAX_ZOOM = 15

# Small icon for zoom levels <= 15
smallIconSvg = """<svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>"""

class CityBikeMarker extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  @getStopIcon: (mode, selected, zoom) ->
    L.divIcon
      html: if zoom <= STOPS_SMALL_MAX_ZOOM then smallIconSvg else Icon.asString 'icon-icon_citybike', 'city-bike-medium-size'
      iconSize: if zoom <= STOPS_SMALL_MAX_ZOOM then [8, 8] else [20, 20]
      className: mode + ' cursor-pointer'

  componentDidMount: ->
    @props.map.on 'zoomend', @onMapMove
    @onMapMove()

  componentWillUnmount: ->
    @props.map.off 'zoomend', @onMapMove

  onMapMove: =>
    @forceUpdate()

  getStopMarker: ->
    CityBikePopupWithContext = provideContext CityBikePopup,
      intl: intl.intlShape.isRequired
      history: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired
    <Marker map={@props.map}
            position={lat: @props.station.y, lng: @props.station.x}
            icon={CityBikeMarker.getStopIcon(
              "bicycle_rent" + (if @props.thin then " thin" else ""),
              @props.selected,
              @props.map.getZoom())}>
       <Popup options={
         offset: [106, 3]
         closeButton: false
         maxWidth: 250
         minWidth: 250
         className: "popup"}>
         <CityBikePopupWithContext context={@context} station={@props.station}/>
       </Popup>
    </Marker>

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getStopMarker()}
    </div>

module.exports = CityBikeMarker
