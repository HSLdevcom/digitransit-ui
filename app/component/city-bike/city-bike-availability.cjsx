React                 = require 'react'
cx                    = require 'classnames'
{FormattedMessage}    = require('react-intl')
ComponentUsageExample = require '../documentation/component-usage-example'


CityBikeAvailability = (props) ->

  columnWidth = {width: (100.0 / props.totalSpaces) + "%"}
  rows = [0 ... props.totalSpaces].map (_, i) ->
    <div
      key={i}
      className={cx "city-bike-column", {available: i < props.bikesAvailable}}
      style=columnWidth
    />

  <div className="city-bike-availability-container">
    <p className="sub-header-h4 bike-availability-header">
      <FormattedMessage id='bike-availability' defaultMessage='Bikes available' />
      {"\u00a0"}({if isNaN props.bikesAvailable then 0 else props.bikesAvailable}/{if isNaN props.totalSpaces then 0 else props.totalSpaces})
    </p>
    <div className="row">
      {rows}
    </div>
  </div>

CityBikeAvailability.displayName = "CityBikeAvailability"

CityBikeAvailability.description =
  <div>
    <p>Renders information about citybike availability</p>
    <ComponentUsageExample description="">
      <CityBikeAvailability bikesAvailable={1} totalSpaces={3}/>
    </ComponentUsageExample>
  </div>

CityBikeAvailability.propTypes =
  bikesAvailable: React.PropTypes.number.isRequired
  totalSpaces: React.PropTypes.number.isRequired

module.exports = CityBikeAvailability
