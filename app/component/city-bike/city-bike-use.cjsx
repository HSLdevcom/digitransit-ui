React                 = require 'react'
{FormattedMessage}    = require('react-intl')
ComponentUsageExample = require('../documentation/ComponentUsageExample').default
config                = require '../../config'

CityBikeUse = ({lang}) ->
  <div className="city-bike-use-container">
    <p className="sub-header-h4 text-center">
      <FormattedMessage id='citybike-register-required' defaultMessage='Citybikes requires registration' />
    </p>
    <a href={config.cityBike.useUrl[lang]}>
      <button className="use-bike-button cursor-pointer">
        <FormattedMessage id='use-citybike' defaultMessage='Use a bike'/>
      </button>
    </a>
  </div>

CityBikeUse.displayName = "CityBikeUse"

CityBikeUse.description =
    <div>
      <p>Renders use citybike component</p>
      <ComponentUsageExample description="">
        <CityBikeUse/>
      </ComponentUsageExample>
    </div>

CityBikeUse.propTypes =
  lang: React.PropTypes.string.isRequired

module.exports = CityBikeUse
