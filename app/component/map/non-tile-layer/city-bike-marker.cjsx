React         = require 'react'
isBrowser     = window?
CityBikePopup = require '../popups/city-bike-popup'
provideContext = require 'fluxible-addons-react/provideContext'
intl          = require 'react-intl'
Icon          = require '../../icon/icon'
GenericMarker = require '../generic-marker'
Example               = require '../../documentation/example-data'
ComponentUsageExample = require '../../documentation/component-usage-example'


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
      id={@props.station.id}
    >
      <CityBikePopupWithContext context={@context} coords={lat: @props.station.y, lng: @props.station.x} station={@props.station}/>
    </GenericMarker>

  render: ->
    unless isBrowser
      return ""
    <div>
      {@getCityBikeMarker()}
    </div>

module.exports = CityBikeMarker
