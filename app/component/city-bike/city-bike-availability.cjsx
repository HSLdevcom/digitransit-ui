React                 = require 'react'
cx                    = require 'classnames'
{FormattedMessage}    = require('react-intl')
ComponentUsageExample = require('../documentation/ComponentUsageExample').default
config                = require '../../config'

CityBikeAvailability = (props) ->
  availablepct =  (100 * props.bikesAvailable / props.totalSpaces)
  availableClass = if availablepct == 0 then "available-none" else if props.bikesAvailable <= config.cityBike.fewAvailableCount then "available-few" else "available-more"
  totalClass = if availablepct == 100 then "available-more" else "available-none"
  separator = if availablepct > 0 and availablepct < 100 then "separate"


  #leave room for rounded ends
  if availablepct < 5 then availablepct = 5
  if availablepct > 95 then availablepct = 95

  <div className="city-bike-availability-container">
    <p className="sub-header-h4 bike-availability-header">
      <FormattedMessage id='bike-availability' defaultMessage='Bikes available' />
      {"\u00a0"}({if isNaN props.bikesAvailable then 0 else props.bikesAvailable}/{if isNaN props.totalSpaces then 0 else props.totalSpaces})
    </p>
    <div className="row">
      <div className={cx("city-bike-column", availableClass, separator)} style={"width": availablepct + "%" }></div>
      <div className={cx("city-bike-column", totalClass, separator)} style={"width": (100 - availablepct) + "%" }></div>
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
