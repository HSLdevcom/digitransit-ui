React         = require 'react'
Relay         = require 'react-relay'
StopRoute     = require('../../../route/StopRoute').default
isBrowser     = window?
StopMarkerPopup = require '../popups/stop-marker-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'
GenericMarker = require '../generic-marker'


iconSvg = """<svg viewBox="0 0 18 18">
    <circle key="halo" class="stop-halo" cx="9" cy="9" r="8" stroke-width="1"/>
    <circle key="stop" class="stop" cx="9" cy="9" r="4.5" stroke-width="4"/>
  </svg>"""

# A slightly bigger icon to be showed on stop page map for the selected stop
selectedIconSvg = """<svg viewBox="0 0 28 28">
    <circle key="halo" class="stop-halo" cx="14" cy="14" r="13" stroke-width="1"/>
    <circle key="stop" class="stop" cx="14" cy="14" r="8" stroke-width="7"/>
  </svg>"""

# Small icon for zoom levels <= 15
smallIconSvg = """<svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>"""

class StopMarker extends React.Component
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  getStopMarker: ->
    StopMarkerPopupWithContext = provideContext StopMarkerPopup,
      intl: intl.intlShape.isRequired
      router: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    #TODO: cjsx doesn't like objects withing nested elements
    loadingPopupStyle = {"height": 150}

    <GenericMarker
      position={lat: @props.stop.lat, lon: @props.stop.lon}
      mode={@props.mode}
      icons={smallIconSvg: smallIconSvg, iconSvg: iconSvg, selectedIconSvg: selectedIconSvg}
      iconSizes={smallIconSvg: [8, 8], iconSvg: [18, 18], selectedIconSvg: [28, 28]}
      map={@props.map}
      layerContainer={@props.layerContainer}
      id={@props.stop.gtfsId}
      renderName={@props.renderName}
      selected={@props.selected}
      name={@props.stop.name}
    >
      <Relay.RootContainer
        Component={StopMarkerPopup}
        route={new StopRoute(
          stopId: @props.stop.gtfsId
          date: @context.getStore('TimeStore').getCurrentTime().format("YYYYMMDD")
        )}
        renderLoading={() => <div className="card" style=loadingPopupStyle><div className="spinner-loader"/></div>}
        renderFetched={(data) => <StopMarkerPopupWithContext {... data} context={@context}/>}
      />
    </GenericMarker>

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getStopMarker()}
    </div>

module.exports = StopMarker
