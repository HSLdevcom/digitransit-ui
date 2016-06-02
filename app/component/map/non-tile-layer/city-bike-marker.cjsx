React         = require 'react'
Relay         = require 'react-relay'
isBrowser     = window?
CityBikePopup = require '../popups/city-bike-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'
Icon          = require '../../icon/icon'
GenericMarker = require '../generic-marker'
Example               = require '../../documentation/ExampleData'
ComponentUsageExample = require('../../documentation/ComponentUsageExample').default
CityBikeRoute         = require('../../../route/CityBikeRoute').default


# Small icon for zoom levels <= 15
smallIconSvg = """<svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>"""

class CityBikeMarker extends React.Component

  @description:
    <div>
      <p>Renders a citybike marker</p>
      <ComponentUsageExample description="">
        <CityBikeMarker
          key={Example.station.id}
          map={"leaflet map here"}
          station={Example.station}
        >
        </CityBikeMarker>
      </ComponentUsageExample>
    </div>

  @displayName: "CityBikeMarker"

  @propTypes:
    station: React.PropTypes.object.isRequired
    map: React.PropTypes.object.isRequired

  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  getCityBikeMediumIcon: =>
    Icon.asString 'icon-icon_citybike', 'city-bike-medium-size'

  getCityBikeMarker: ->
    loadingPopupStyle = height: 150

    CityBikePopupWithContext = provideContext CityBikePopup,
      intl: intl.intlShape.isRequired
      router: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    <GenericMarker
      position={lat: @props.station.y, lon: @props.station.x}
      mode="citybike"
      icons={smallIconSvg: smallIconSvg, iconSvg: @getCityBikeMediumIcon()}
      iconSizes={smallIconSvg: [8, 8], iconSvg: [20, 20]}
      map={@props.map}
      layerContainer={@props.layerContainer}
      id={@props.station.id}
    >
      <Relay.RootContainer
        Component={CityBikePopup}
        route={new CityBikeRoute(
          stationId: @props.station.id
        )}
        renderLoading={() => <div className="card" style=loadingPopupStyle><div className="spinner-loader"/></div>}
        renderFetched={(data) => <CityBikePopupWithContext {... data} context={@context}/>}
      />
    </GenericMarker>

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getCityBikeMarker()}
    </div>

module.exports = CityBikeMarker
