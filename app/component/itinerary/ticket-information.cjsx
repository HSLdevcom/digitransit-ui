React = require 'react'
NotImplementedLink = require '../util/not-implemented-link'

{FormattedMessage} = require('react-intl')

class TicketInformation extends React.Component

  render: ->
    <div className="itinerary-ticket-information">
      <div>
        <FormattedMessage
          id='required-ticket'
          defaultMessage='Ticket required for the journey' /><div className="itinerary-ticket-information-class">Helsinki</div>
      </div>
      <div className="itinerary-ticket-information-buy">
        <NotImplementedLink name={<FormattedMessage id='buy-ticket' defaultMessage='Buy a ticket' />}/>
      </div>
    </div>


module.exports = TicketInformation
