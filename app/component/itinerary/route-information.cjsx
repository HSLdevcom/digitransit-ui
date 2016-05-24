React              = require 'react'
NotImplementedLink = require '../util/not-implemented-link'
Icon               = require '../icon/icon'
{FormattedMessage} = require('react-intl')

class RouteInformation extends React.Component
  render: ->
    <div className="itinerary-route-information row">
      <div className="small-6 columns">
        <FormattedMessage id='weather-at-destination'
          defaultMessage='Weather at destination' />
      </div>
      <div className="small-6 columns noborder">
        <FormattedMessage id='trip-co2-emissions'
          defaultMessage='Trip CO2 emissions' />
      </div>
    </div>


module.exports = RouteInformation
