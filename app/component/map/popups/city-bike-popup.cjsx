React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
Icon                  = require '../../icon/icon'
MarkerPopupBottom     = require '../marker-popup-bottom'
NotImplementedLink    = require '../../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
CityBikeContent       = require '../../city-bike/city-bike-content'
CityBikeCard          = require '../../city-bike/city-bike-card'
Example               = require '../../documentation/example-data'
ComponentUsageExample = require '../../documentation/component-usage-example'
{getRoutePath}        = require '../../../util/path'
config                = require '../../../config'

class CityBikePopup extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @description:
    <div>
      <p>Renders a citybike popup.</p>
      <ComponentUsageExample description="">
        <CityBikePopup
          context={"context object here"}
          station={Example.station}>
          Im content of a citybike card
        </CityBikePopup>
      </ComponentUsageExample>
    </div>

  @displayName: "CityBikePopup"

  @propTypes:
    station: React.PropTypes.object.isRequired
    context: React.PropTypes.object.isRequired

  render: ->
    locationString = if @props.context.getStore then @props.context.getStore('PositionStore').getLocationString() else ""
    routePath = getRoutePath(locationString, @props.station.name + '::' + @props.station.lat + ',' + @props.station.lon)
    <div className="card">
      <CityBikeCard
        className={"padding-small"}
        station={@props.station}>
        <CityBikeContent lang={@context.getStore('PreferencesStore').getLanguage()} station={@props.station}/>
      </CityBikeCard>
      <MarkerPopupBottom routeHere={routePath}>
        <a href={config.cityBike.infoUrl[@context.getStore('PreferencesStore').getLanguage()]}>
          <Icon img={'icon-icon_info'}/> <FormattedMessage id='extra-info' defaultMessage='More info' /><br/>
        </a>
      </MarkerPopupBottom>
    </div>


module.exports = Relay.createContainer CityBikePopup,
  fragments: queries.CityBikePopupFragments
