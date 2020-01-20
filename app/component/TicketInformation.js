import cx from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import ExternalLink from './ExternalLink';
import { renderZoneTicket } from './ZoneTicket';
import { getAlternativeFares } from '../util/fareUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';

export const getUtmParameters = (agency, config) => {
  const gtfsId = get(agency, 'gtfsId');
  if (!gtfsId) {
    return '';
  }
  const parameters = get(
    config,
    `ticketInformation.trackingParameters['${gtfsId}']`,
  );
  if (!parameters) {
    return '';
  }
  return `?${Object.keys(parameters)
    .map(key => `${key}=${encodeURIComponent(parameters[key])}`)
    .join('&')}`;
};

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
  const unknownFareLeg = legs.filter(leg => leg.route).find(leg => {
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
  return (
    <div className="row itinerary-ticket-information">
      <div className="itinerary-ticket-type">
        <div className="ticket-type-title">
          <FormattedMessage
            id={
              isMultiComponent
                ? 'itinerary-tickets.title'
                : 'itinerary-ticket.title'
            }
            defaultMessage="Required tickets"
          />:
        </div>
        {fares.map((fare, i) => (
          <div
            className={cx('ticket-type-zone', {
              'multi-component': isMultiComponent,
            })}
            key={i} // eslint-disable-line react/no-array-index-key
          >
            {fare.isUnknown ? (
              <div>
                <div className="ticket-identifier">{unknownFareRouteName}</div>
                {fare.agency && (
                  <div className="ticket-description">{fare.agency.name}</div>
                )}
              </div>
            ) : (
              <div>
                <div className="ticket-identifier">
                  {config.useTicketIcons
                    ? renderZoneTicket(fare.ticketName, alternativeFares)
                    : fare.ticketName}
                </div>
                {config.showTicketPrice && (
                  <div className="ticket-description">
                    {`${intl.formatMessage({ id: 'ticket-single-adult' })}, ${(
                      fare.cents / 100
                    ).toFixed(2)} €`}
                  </div>
                )}
              </div>
            )}
            {fare.agency &&
              fare.agency.fareUrl && (
                <div className="ticket-type-agency-link">
                  <ExternalLink
                    className="itinerary-ticket-external-link"
                    href={`${fare.agency.fareUrl}${getUtmParameters(
                      fare.agency,
                      config,
                    )}`}
                    onClick={() => {
                      addAnalyticsEvent({
                        category: 'Itinerary',
                        action: 'OpenHowToBuyTicket',
                        name: null,
                      });
                    }}
                  >
                    {intl.formatMessage({ id: 'extra-info' })}
                  </ExternalLink>
                </div>
              )}
          </div>
        ))}
      </div>
      {config.ticketLink && (
        <ExternalLink
          className="itinerary-ticket-external-link"
          href={config.ticketLink}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Itinerary',
              action: 'OpenHowToBuyTicket',
              name: null,
            });
          }}
        >
          {intl.formatMessage({ id: 'buy-ticket' })}
        </ExternalLink>
      )}
    </div>
  );
}

TicketInformation.propTypes = {
  legs: PropTypes.array,
  fares: PropTypes.arrayOf(
    PropTypes.shape({
      agency: PropTypes.shape({
        fareUrl: PropTypes.string,
        name: PropTypes.string,
      }),
      fareId: PropTypes.string,
      cents: PropTypes.number,
      isUnknown: PropTypes.bool,
      routeName: PropTypes.string,
      ticketName: PropTypes.string,
    }),
  ),
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

TicketInformation.description = () => (
  <div>
    <p>Information about the required ticket for the itinerary.</p>
    <ComponentUsageExample description="single fare">
      <TicketInformation
        fares={[{ fareId: 'HSL:AB', cents: 280, ticketName: 'AB' }]}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="single fare, with agency fare url">
      <TicketInformation
        fares={[
          {
            agency: { fareUrl: 'foo' },
            cents: 280,
            fareId: 'HSL:AB',
            ticketName: 'AB',
          },
        ]}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="single fare, multiple options">
      <TicketInformation
        fares={[{ fareId: 'HSL:AB', cents: 280, ticketName: 'AB' }]}
        zones={['B']}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="multiple fares">
      <TicketInformation
        fares={[
          { fareId: 'HSL:AB', cents: 280, ticketName: 'AB' },
          { fareId: 'HSL:BC', cents: 280, ticketName: 'BC' },
        ]}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="unknown fare">
      <TicketInformation
        fares={[
          { fareId: 'HSL:ABC', cents: 460, ticketName: 'ABC' },
          {
            agency: { fareUrl: 'foo', name: 'Ferry operator' },
            isUnknown: true,
            routeName: 'Ferry line',
          },
        ]}
      />
    </ComponentUsageExample>
  </div>
);
