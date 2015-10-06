React             = require 'react'
FormattedMessage  = require('react-intl').FormattedMessage

###
  Headers for 3 columns
###
class TripListHeader extends React.Component
  render: ->
    <div className="route-list-header route-stop row padding-vertical-small">
      <div className="columns small-3 route-stop-now">
        <FormattedMessage id='time' defaultMessage='Time' />
      </div>
      <div className="columns small-6 route-stop-name">
        <FormattedMessage id='stop' defaultMessage='Stop' />
      </div>
      <div className="columns small-3 route-stop-code">
        <FormattedMessage id='stop-number' defaultMessage='Stop number' />
      </div>
    </div>

module.exports = TripListHeader
