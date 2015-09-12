React = require 'react'

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

class TicketInformation extends React.Component

  render: ->
    <div className="itinerary-ticket-information">
      <div className="itinerary-ticket-information-buy">
        Osta lippu
      </div>
      <div>
        <FormattedMessage id='required-ticket'
                          defaultMessage='Reitillä tarvittava lippu' />
      </div>
      <div className="itinerary-ticket-information-price">
        : €
      </div>
    </div>

module.exports = TicketInformation
