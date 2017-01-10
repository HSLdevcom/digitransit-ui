import React from 'react';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import { plan as examplePlan } from './ExampleData';

export default function TicketInformation({ fares }) {
  let currency;
  let regularFare;
  if (fares != null) {
    regularFare = fares.filter(fare => fare.type === 'regular')[0];

    switch (regularFare.currency) {
      case 'EUR':
      default:
        currency = '€';
    }
  }

  return (
    <div className="itinerary-ticket-information">
      <div>
        <FormattedMessage id="required-ticket" defaultMessage="Ticket required for the journey" />:
        <div className="itinerary-ticket-information-class">
          {regularFare ? `${(regularFare.cents / 100).toFixed(2)} ${currency}` : 'alk. 2,70€'}
        </div>
      </div>
      <div className="itinerary-ticket-information-buy">
        <a href="https://www.hsl.fi/liput-ja-hinnat">
          <FormattedMessage
            id="buy-ticket"
            defaultMessage="How to buy a ticket (HSL.fi)"
          /> ›
        </a>
      </div>
    </div>
  );
}

TicketInformation.propTypes = {
  fares: React.PropTypes.array,
};

TicketInformation.displayName = 'TicketInformation';

TicketInformation.description = () =>
  <div>
    <p>Information about the required ticket for the itinerary.</p>
    <ComponentUsageExample>
      <TicketInformation fares={examplePlan.itineraries[0].fares} />
    </ComponentUsageExample>
  </div>;
