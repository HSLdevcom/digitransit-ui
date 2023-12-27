import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import { v4 as uuid } from 'uuid';
import { renderZoneTicket } from './ZoneTicket';
import Icon from './Icon';
import { getAlternativeFares } from '../util/fareUtils';
import { FareShape } from '../util/shapes';

const getUnknownFareRoute = (fares, route) => {
  for (let i = 0; i < fares.length; i++) {
    if (fares[i].routeGtfsId === route.gtfsId) {
      return true;
    }
  }
  return false;
};
export default function TicketInformation(
  { fares, zones, legs },
  { config, intl },
) {
  if (fares.length === 0) {
    return null;
  }

  const isMultiComponent = fares.length > 1;
  const alternativeFares = getAlternativeFares(
    zones,
    fares.filter(fare => !fare.isUnknown),
    config.availableTickets,
  );

  // DT-3314 If Fare is unknown show Correct leg's route name instead of whole trip that fare.routeName() returns.
  const unknownFares = fares.filter(fare => fare.isUnknown);
  const unknownFareLeg = legs
    .filter(leg => leg.route)
    .find(leg => {
      const foundRoute = getUnknownFareRoute(unknownFares, leg.route);
      if (foundRoute) {
        return leg;
      }
      return null;
    });
  let unknownFareRouteName = unknownFareLeg
    ? unknownFareLeg.from.name.concat(' - ').concat(unknownFareLeg.to.name)
    : null;
  // Different logic for ferries
  if (unknownFareLeg && unknownFareLeg.mode === 'FERRY') {
    unknownFareRouteName = unknownFares[0].routeName;
  }

  const faresInfo = fares.map((fare, i) => {
    let header;

    if (i === 0) {
      header = `${intl.formatMessage({
        id: isMultiComponent
          ? 'itinerary-tickets.title'
          : 'itinerary-ticket.title',
        defaultMessage: 'Required tickets',
      })}:`;
    }
    return (
      <div key={uuid()} className="ticket-container">
        <div className="ticket-type-title">{header}</div>
        <div
          className={cx('ticket-type-zone', {
            'multi-component': isMultiComponent,
          })}
          key={i} // eslint-disable-line react/no-array-index-key
        >
          {fare.isUnknown ? (
            <div className="unknown-fare-container">
              <div className="ticket-identifier">{unknownFareRouteName}</div>
              {fare.agency && !config.hideExternalOperator(fare.agency) && (
                <div className="ticket-description">{fare.agency.name}</div>
              )}
            </div>
          ) : (
            (config.ticketLink && (
              <a href={config.ticketLink}>
                <div className="ticket-identifier">
                  {config.useTicketIcons
                    ? renderZoneTicket(fare.ticketName, alternativeFares)
                    : fare.ticketName}
                </div>
                {config.showTicketPrice && (
                  <div className="ticket-description">
                    {`${fare.price.toFixed(2)} €`}
                  </div>
                )}
                <Icon img="icon-icon_arrow-collapse--right" />
              </a>
            )) || (
              <div className="fare-container">
                <div className="ticket-identifier">
                  {config.useTicketIcons
                    ? renderZoneTicket(fare.ticketName, alternativeFares)
                    : fare.ticketName}
                </div>
                {config.showTicketPrice && (
                  <div className="ticket-description">
                    {`${fare.price.toFixed(2)} €`}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  });

  return (
    <div className="itinerary-ticket-information">
      <div className="itinerary-ticket-type">{faresInfo}</div>
    </div>
  );
}

TicketInformation.propTypes = {
  legs: PropTypes.array,
  fares: PropTypes.arrayOf(FareShape),
  zones: PropTypes.arrayOf(PropTypes.string),
};

TicketInformation.defaultProps = {
  fares: [],
  zones: [],
  legs: [],
};

TicketInformation.contextTypes = {
  config: PropTypes.object,
  intl: intlShape.isRequired,
};

TicketInformation.displayName = 'TicketInformation';
