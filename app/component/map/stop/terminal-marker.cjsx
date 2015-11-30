React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
isBrowser     = window?
Icon          = require '../../icon/icon'
StopMarkerPopup = require './stop-marker-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'
GenericMarker = require '../generic-marker'



# Small icon for zoom levels <= 15
smallIconSvg = """<svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>"""

class TerminalMarker extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  getTerminalMediumIcon: =>
    Icon.asString 'icon-icon_station', 'terminal-medium-size'

  getTerminalMarker: ->
    StopMarkerPopupWithContext = provideContext StopMarkerPopup,
      intl: intl.intlShape.isRequired
      history: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    #TODO: cjsx doesn't like objects withing nested elements
    loadingPopupStyle = {"height": 150}

    <GenericMarker
      position={lat: @props.terminal.lat, lon: @props.terminal.lon}
      mode={@props.mode}
      icons={smallIconSvg: smallIconSvg, iconSvg: @getTerminalMediumIcon()}
      iconSizes={smallIconSvg: [8, 8], iconSvg: [20, 20]}
      map={@props.map}
      id={@props.terminal.gtfsId}
      renderName={false}
      selected={@props.selected}
      name={@props.terminal.name}
    >
    #TODO: TerminalPopup
    </GenericMarker>

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getTerminalMarker()}
    </div>

module.exports = TerminalMarker
