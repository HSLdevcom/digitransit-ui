import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';

import { v4 as uuid } from 'uuid';
import { renderZoneTicket } from './ZoneTicket';
import { getAlternativeFares } from '../util/fareUtils';
import { FareShape } from '../util/shapes';
import ExternalLink from './ExternalLink';

export default function MobileTicketPurchaseInformation(
  { fares, zones },
  { config, intl },
) {
  if (fares.length === 0) {
    return null;
  }
  const fare = fares[0]; // Show buy option only if there is single ticket available
  const alternativeFares = getAlternativeFares(
    zones,
    !fare.isUnknown,
    config.availableTickets,
  );
  const faresInfo = () => {
    const header = `${intl.formatMessage({
      id: 'itinerary-ticket.title',
      defaultMessage: 'Required ticket',
    })}:`;
    return (
      <div key={uuid()} className="ticket-container">
        <div className="ticket-type-title">{header}</div>
        <div className="ticket-type-zone" key={uuid()}>
          <div className="fare-container">
            <div className="ticket-identifier">
              {config.useTicketIcons
                ? renderZoneTicket(fare.ticketName, alternativeFares, true)
                : fare.ticketName}
            </div>

            <div className="ticket-description">
              {`${(fare.cents / 100).toFixed(2)} €`}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="itinerary-ticket-information-purchase">
      <div className="itinerary-pinfo-ticket-type">
        {faresInfo()}
        <div className="app-link">
          <ExternalLink href={config.ticketPurchaseLink(fare.ticketname)}>
            <FormattedMessage id="buy-single-ticket" />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
}
MobileTicketPurchaseInformation.propTypes = {
  fares: PropTypes.arrayOf(FareShape),
  zones: PropTypes.arrayOf(PropTypes.string),
};

MobileTicketPurchaseInformation.defaultProps = {
  fares: [],
  zones: [],
};

MobileTicketPurchaseInformation.contextTypes = {
  config: PropTypes.object,
  intl: intlShape.isRequired,
};

MobileTicketPurchaseInformation.displayName = 'TicketInformation';
