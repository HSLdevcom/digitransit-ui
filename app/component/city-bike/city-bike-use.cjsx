React                 = require 'react'
{FormattedMessage}    = require('react-intl')


CityBikeUse = (props) ->

  render: ->

    <div className="city-bike-use-container">
      <p className="sub-header-h4 text-center">
        <FormattedMessage id='citybike-register-required' defaultMessage='Citybikes requires registration' />
      </p>
      <button className="use-bike-button cursor-pointer">
        <FormattedMessage id='use-citybike' defaultMessage='Use a bike'/>
      </button>

    </div>

CityBikeUse.displayName = "CityBikeUse"

module.exports = CityBikeUse
