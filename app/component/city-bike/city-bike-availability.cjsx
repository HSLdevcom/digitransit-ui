React                 = require 'react'
cx                    = require 'classnames'
{FormattedMessage}    = require('react-intl')

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

module.exports = CityBikeAvailability
