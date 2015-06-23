React = require 'react'

class TicketInformation extends React.Component

  render: ->
    <div className="itinerary-ticket-information">
      <div className="itinerary-ticket-information-buy">
        Osta lippu
      </div>
      <div>
        Reitillä tarvittava lippu
      </div>
      <div className="itinerary-ticket-information-price">
        : €
      </div>
    </div>

module.exports = TicketInformation
