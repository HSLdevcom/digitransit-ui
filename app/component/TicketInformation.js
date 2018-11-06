import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import { plan as examplePlan } from './ExampleData';
import ExternalLink from './ExternalLink';
import Icon from './Icon';
import ZoneTicketIcon from './ZoneTicketIcon';
import mapFares from '../util/fareUtils';

const renderTicketZoneIcon = (zoneId, isOnlyZoneB) => {
  if (!isOnlyZoneB) {
    return <ZoneTicketIcon ticketType={zoneId} />;
  }
  return (
    <div className="zone-ticket-multiple-options">
      <ZoneTicketIcon ticketType="AB" />
      <FormattedMessage id="or" />
      <ZoneTicketIcon ticketType="BC" />
    </div>
  );
};

export default function TicketInformation({ fares, zones }, { config, intl }) {
  const currency = '€';
  const mappedFares = mapFares(fares, config, intl.locale);
  if (!mappedFares) {
    return null;
  }
  const [regularFare] = fares.filter(fare => fare.type === 'regular');
  const isMultiComponent = mappedFares.length > 1;
  const isOnlyZoneB =
    zones.length === 1 &&
    zones[0] === 'B' &&
    mappedFares.length === 1 &&
    (mappedFares[0] === 'AB' || mappedFares[0] === 'BC');

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
                renderTicketZoneIcon(component, isOnlyZoneB)
              ) : (
                <span>{component}</span>
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
  zones: PropTypes.arrayOf(PropTypes.string),
};

TicketInformation.defaultProps = {
  zones: [],
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
