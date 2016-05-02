React                 = require 'react'
config                = require '../../config'
CityBikeAvailability  = require './city-bike-availability'
CityBikeUse           = require './city-bike-use'
ComponentUsageExample = require '../documentation/component-usage-example'
Example = require '../documentation/example-data'


CityBikeContent = (props) ->

  render: ->
    # Available is hardcoded to  0, because when station information is static,
    # OTP always shows free bikes.
    # In production we could use props.station.bikesAvailable
    <div className="city-bike-container">
      <CityBikeAvailability
        bikesAvailable={props.station.bikesAvailable}
        totalSpaces={props.station.bikesAvailable + props.station.spacesAvailable}/>
      <CityBikeUse lang={props.lang}/>
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

module.exports = CityBikeContent
