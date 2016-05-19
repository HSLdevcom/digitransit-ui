React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../../queries'
Icon                  = require '../../icon/icon'
MarkerPopupBottom     = require '../marker-popup-bottom'
NotImplementedLink    = require '../../util/not-implemented-link'
{FormattedMessage}    = require('react-intl')
CityBikeContent       = require '../../city-bike/city-bike-content'
CityBikeCard          = require '../../city-bike/city-bike-card'
Example               = require '../../documentation/ExampleData'
ComponentUsageExample = require('../../documentation/ComponentUsageExample').default
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
    <div className="card">
      <CityBikeCard
        className={"padding-small"}
        station={@props.station}>
        <CityBikeContent lang={@context.getStore('PreferencesStore').getLanguage()} station={@props.station}/>
      </CityBikeCard>
      <MarkerPopupBottom location={{
        address: @props.station.name
        lat: @props.station.lat
        lon: @props.station.lon
      }}/>
    </div>


module.exports = Relay.createContainer CityBikePopup,
  fragments: queries.CityBikePopupFragments
