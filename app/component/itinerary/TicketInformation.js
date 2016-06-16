import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

export default function TicketInformation() {
  return (
    <div className="itinerary-ticket-information">
      <div>
        <FormattedMessage id="required-ticket" defaultMessage="Ticket required for the journey" />:
        <div className="itinerary-ticket-information-class">Helsinki</div>
      </div>
      <div className="itinerary-ticket-information-buy">
        <a target="_blank" href="https://www.hsl.fi/liput-ja-hinnat">
          <FormattedMessage
            id="buy-ticket"
            defaultMessage="How to buy a ticket (HSL.fi)"
          /> ›
        </a>
      </div>
    </div>
  );
}

TicketInformation.description = (
  <div>
    <p>Information about the required ticket for the itinerary.</p>
    <ComponentUsageExample>
      <TicketInformation />
    </ComponentUsageExample>
  </div>);
