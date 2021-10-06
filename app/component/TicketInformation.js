import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import { v4 as uuid } from 'uuid';
import ExternalLink from './ExternalLink';
import { renderZoneTicket } from './ZoneTicket';
import { getAlternativeFares } from '../util/fareUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import Icon from './Icon';

const getUnknownFareRoute = (fares, route) => {
  for (let i = 0; i < fares.length; i++) {
    if (fares[i].routeGtfsId === route.gtfsId) {
      return true;
    }
  }
  return false;
};
export default function TicketInformation(
  { fares, zones, legs, loaded },
  { config, intl },
) {
  // Only show ticket information if fares data is loaded and there's at least one transit leg.
  if (!loaded || (legs.length !== 0 && !legs.some(leg => leg.transitLeg))) {
    return null;
  }

  const areUnknown = fares.length === 0 || fares.some(fare => fare.isUnknown);
  const isMultiComponent = fares.length > 1;
  const alternativeFares = getAlternativeFares(
    zones,
    fares.filter(fare => !fare.isUnknown),
    config.availableTickets,
  );

  const hasBikeLeg = legs.some(
    leg =>
      leg.rentedBike || leg.mode === 'BICYCLE' || leg.mode === 'BICYCLE_WALK',
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
      header = (
        <div>
          <FormattedMessage
            id={
              isMultiComponent
                ? 'itinerary-tickets.title'
                : 'itinerary-ticket.title'
            }
            defaultMessage="Required tickets"
          />
          :
        </div>
      );
    }

    const ticketUrl = () => {
      if (fare.agency && fare.agency.fareUrl) {
        return fare.agency.fareUrl;
      }
      if (fare.url) {
        return fare.url;
      }
      return null;
    };

    return (
      <div key={uuid()}>
        <div key={uuid()} className="ticket-container">
          <div className="ticket-info-container">
            <div className="ticket-type-title">{header}</div>
            <div
              className={cx('ticket-type-zone', {
                'multi-component': isMultiComponent,
              })}
              key={i} // eslint-disable-line react/no-array-index-key
            >
              {fare.isUnknown ? (
                <div className="unknown-fare-container">
                  <div className="ticket-identifier">
                    {unknownFareRouteName}
                  </div>
                  {fare.agency && !config.hideExternalOperator(fare.agency) && (
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
                      {`${(fare.cents / 100).toFixed(2)} €`}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {fare.isUnknown
            ? fare.agency &&
              fare.agency.fareUrl &&
              !config.hideExternalOperator(fare.agency) && (
                <div
                  className="ticket-type-agency-link"
                  key={i} // eslint-disable-line react/no-array-index-key
                >
                  <ExternalLink
                    className="itinerary-ticket-external-link"
                    href={fare.agency.fareUrl}
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
              )
            : fare.agency &&
              fare.agency.fareUrl && (
                <div
                  className="ticket-type-agency-link"
                  key={i} // eslint-disable-line react/no-array-index-key
                >
                  <ExternalLink
                    className="itinerary-ticket-external-link"
                    href={fare.agency.fareUrl}
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
          {ticketUrl() && (
            <div
              className="ticket-type-agency-link"
              key={i} // eslint-disable-line react/no-array-index-key
            >
              <ExternalLink
                className="itinerary-ticket-external-link"
                href={ticketUrl()}
              >
                {intl.formatMessage({ id: 'buy-ticket' })}
              </ExternalLink>
            </div>
          )}
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
        <div key={uuid()} className="ticket-container">
          <div className="ticket-info-container small">
            <FormattedMessage id="fares-disclaimer" />
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className="row itinerary-ticket-information">
      {areUnknown ? (
        <div className="itinerary-ticket-type">
          <div className="info-container">
            <div className="icon-container">
              <Icon className="info" img="icon-icon_info" />
            </div>
            <div className="description-container">
              <FormattedMessage
                id="missing-price-info-disclaimer"
                defaultMessage="No price information"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="itinerary-ticket-type">
          {faresInfo}

          {hasBikeLeg && (
            <div className="info-container">
              <div className="icon-container">
                <Icon className="info" img="icon-icon_info" />
              </div>
              <div className="description-container">
                <FormattedMessage
                  id="only-public-transport-disclaimer"
                  defaultMessage="Price only valid for public transport part of the journey"
                />
              </div>
            </div>
          )}
        </div>
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
  loaded: PropTypes.bool,
};

TicketInformation.defaultProps = {
  fares: [],
  zones: [],
  legs: [],
  loaded: false,
};

TicketInformation.contextTypes = {
  config: PropTypes.object,
  intl: intlShape.isRequired,
};

TicketInformation.displayName = 'TicketInformation';
