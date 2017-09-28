import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import get from 'lodash/get';
import ComponentUsageExample from './ComponentUsageExample';
import { plan as examplePlan } from './ExampleData';
import Icon from './Icon';
import ExternalLink from './ExternalLink';

export default function TicketInformation({ fares }, { config }) {
  let currency;
  let regularFare;
  if (fares != null) {
    regularFare = fares.filter(fare => fare.type === 'regular')[0];
  }

  if (!regularFare || regularFare.cents === -1) {
    return null;
  }

  switch (regularFare.currency) {
    case 'EUR':
    default:
      currency = '€';
  }

  // XXX for now we only use single (first) component
  const fareId = get(regularFare, 'components[0].fareId');
  const fareMapping = get(config, 'fareMapping', {});

  const mappedFareId = fareId ? fareMapping[fareId] : null;

  return (
    <div className="row itinerary-ticket-information">
      <div className="itinerary-ticket-layout-left">
        <Icon img="icon-icon_ticket" />
      </div>
      <div className="itinerary-ticket-layout-right">
        <div className="itinerary-ticket-type">
          <div className="ticket-type-zone">
            {mappedFareId && (
              <FormattedMessage id={`ticket-type-${mappedFareId}`} />
            )}
          </div>
          <div>
            <span className="ticket-type-group">
              <FormattedMessage
                id="ticket-single-adult"
                defaultMessage="Adult"
              />,&nbsp;
            </span>
            <span className="ticket-type-fare">
              {`${(regularFare.cents / 100).toFixed(2)} ${currency}`}
            </span>
          </div>
        </div>
        {config.ticketLink && (
          <ExternalLink
            className="itinerary-ticket-external-link"
            href={config.ticketLink}
          >
            <FormattedMessage
              id="buy-ticket"
              defaultMessage="How to buy a ticket"
            />
          </ExternalLink>
        )}
      </div>
    </div>
  );
}

TicketInformation.propTypes = {
  fares: PropTypes.array,
};

TicketInformation.contextTypes = {
  config: PropTypes.object,
  breakpoint: PropTypes.string,
};

TicketInformation.displayName = 'TicketInformation';

TicketInformation.description = () => (
  <div>
    <p>Information about the required ticket for the itinerary.</p>
    <ComponentUsageExample>
      <TicketInformation fares={examplePlan.itineraries[0].fares} />
    </ComponentUsageExample>
  </div>
);
