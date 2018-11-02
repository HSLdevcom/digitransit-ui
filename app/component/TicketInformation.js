import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import { plan as examplePlan } from './ExampleData';
import ExternalLink from './ExternalLink';
import Icon from './Icon';
import mapFares from '../util/fareUtils';

const ZoneTicketIcon = (
  { ticketType }, // eslint-disable-line
) =>
  ticketType ? (
    <Icon
      className="zone-ticket-icon"
      img={`icon-icon_zone-ticket-${ticketType.toLowerCase()}`}
      viewBox={`0 0 ${ticketType.length * 44} 44`}
    />
  ) : null;

export default function TicketInformation({ fares }, { config, intl }) {
  const currency = '€';
  const mappedFares = mapFares(fares, config, intl.locale);
  if (!mappedFares) {
    return null;
  }
  const [regularFare] = fares.filter(fare => fare.type === 'regular');
  const isMultiComponent = mappedFares.length > 1;

  return (
    <div className="row itinerary-ticket-information">
      <div className="itinerary-ticket-layout-left">
        <Icon img="icon-icon_ticket" />
      </div>
      <div className="itinerary-ticket-layout-right">
        <div className="itinerary-ticket-type">
          {isMultiComponent && (
            <div className="ticket-type-title">
              <FormattedMessage
                id="itinerary-tickets.title"
                defaultMessage="Required tickets"
              />
            </div>
          )}
          {mappedFares.map((component, i) => (
            <div
              className={cx('ticket-type-zone', {
                'multi-component': isMultiComponent,
              })}
              key={i} // eslint-disable-line react/no-array-index-key
            >
              {config.useTicketIcons ? (
                <ZoneTicketIcon ticketType={component} />
              ) : (
                component
              )}
            </div>
          ))}
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
  intl: intlShape.isRequired,
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
