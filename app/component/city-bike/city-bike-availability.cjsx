React                 = require 'react'
cx                    = require 'classnames'
{FormattedMessage}    = require('react-intl')
ComponentUsageExample = require '../documentation/component-usage-example'

CityBikeAvailability = (props) ->

  <div className="city-bike-availability-container">
    <p className="sub-header-h4 bike-availability-header">
      <FormattedMessage id='bike-availability' defaultMessage='Bikes available' />
       {props.bikesAvailable}/{props.totalSpaces}
    </p>
    <div className="row">
      <div className={cx "col2-unit", {available: props.bikesAvailable > 0}}></div>
      <div className={cx "col2-unit", {available: props.bikesAvailable > 1}}></div>
    </div>
  </div>

CityBikeAvailability.displayName = "CityBikeAvailability"

CityBikeAvailability.description =
  <div>
    <p>Renders information about citybike availability</p>
    <ComponentUsageExample description="">
      <CityBikeAvailability bikesAvailable="1" totalSpaces="2"/>
    </ComponentUsageExample>
  </div>

CityBikeAvailability.propTypes =
  bikesAvailable: React.PropTypes.number.isRequired
  totalSpaces: React.PropTypes.number.isRequired

module.exports = CityBikeAvailability
