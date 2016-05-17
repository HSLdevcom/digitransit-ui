React                 = require 'react'
config                = require '../../config'
CityBikeAvailability  = require './city-bike-availability'
CityBikeUse           = require './city-bike-use'
ComponentUsageExample = require('../documentation/ComponentUsageExample').default
Example = require '../documentation/ExampleData'


CityBikeContent = ({station, lang}) ->
  <div className="city-bike-container">
    <CityBikeAvailability
      bikesAvailable={station.bikesAvailable}
      totalSpaces={station.bikesAvailable + station.spacesAvailable}/>
    <CityBikeUse lang={lang}/>
  </div>

CityBikeContent.displayName = "CityBikeContent"

CityBikeContent.description =
    <div>
      <p>Renders content of a citybike card</p>
      <ComponentUsageExample description="">
        <CityBikeContent station={Example.station}/>
      </ComponentUsageExample>
    </div>

CityBikeContent.propTypes =
  station: React.PropTypes.object.isRequired
  lang: React.PropTypes.string.isRequired

module.exports = CityBikeContent
