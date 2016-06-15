import React from 'react';
import NotImplementedLink from '../util/not-implemented-link';
import Icon from '../icon/icon';
import { FormattedMessage } from 'react-intl';

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
