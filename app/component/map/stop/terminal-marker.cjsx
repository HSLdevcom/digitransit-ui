React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
geoUtils      = require '../../../util/geo-utils'
isBrowser     = window?
Icon          = require '../../icon/icon'
intl          = require 'react-intl'
GenericMarker = require '../generic-marker'
Circle        = if isBrowser then require 'react-leaflet/lib/Circle'
L             = if window? then require 'leaflet' else null


class TerminalMarker extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  getTerminalMediumIcon: =>
    """<span>
        <svg viewBox="0 0 40 40" class="icon terminal-medium-size">
          <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-icon_station--onmap"/>
        </svg>
      </span>"""

  getTerminalMarker: ->
    #TODO: cjsx doesn't like objects withing nested elements
    loadingPopupStyle = {"height": 150}

    <GenericMarker
      position={lat: @props.terminal.lat, lon: @props.terminal.lon}
      mode={@props.mode}
      icons={smallIconSvg: @getTerminalMediumIcon(), iconSvg: @getTerminalMediumIcon()}
      iconSizes={smallIconSvg: [24, 24], iconSvg: [24, 24]}
      map={@props.map}
      id={@props.terminal.gtfsId}
      renderName={@props.renderName}
      selected={@props.selected}
      name={@props.terminal.name}
    >
    #TODO: TerminalPopup
    </GenericMarker>

  render: ->
    unless isBrowser
      return ""
    <div>
      <Circle
        map={@props.map}
        center={lat: @props.terminal.lat, lng: @props.terminal.lon}
        radius={geoUtils.getDistanceToFurthestStop(new L.LatLng(@props.terminal.lat, @props.terminal.lon), @props.terminal.stops).distance}
        fillOpacity=0.05
        weight=1
        opacity=0.3
        className={@props.mode}
        fillColor='currentColor'
        color='currentColor'
      />
      {@getTerminalMarker()}
    </div>

module.exports = TerminalMarker
