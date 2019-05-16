import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import ExternalLink from './ExternalLink';
import { renderZoneTicketIcon, isWithinZoneB } from './ZoneTicketIcon';
import { getFares } from '../util/fareUtils';

export default function TicketInformation(
  { fares: ticketFares, routes, zones },
  { config, intl },
) {
  const fares = getFares(ticketFares, routes, config, intl.locale);
  if (fares.length === 0) {
    return null;
  }

  const isMultiComponent = fares.length > 1;
  const isOnlyZoneB = isWithinZoneB(
    zones,
    fares.filter(fare => !fare.isUnknown),
  );

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
          />
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
                <div className="ticket-identifier">{fare.routeName}</div>
                <div className="ticket-description">{fare.agency.name}</div>
              </div>
            ) : (
              <div>
                <div className="ticket-identifier">
                  {config.useTicketIcons
                    ? renderZoneTicketIcon(fare.ticketName, isOnlyZoneB)
                    : fare.ticketName}
                </div>
                <div className="ticket-description">
                  {`${intl.formatMessage({ id: 'ticket-single-adult' })}, ${(
                    fare.cents / 100
                  ).toFixed(2)} €`}
                </div>
              </div>
            )}
            {fare.agency && (
              <div className="ticket-type-agency-link">
                <ExternalLink
                  className="itinerary-ticket-external-link"
                  href={fare.agency.fareUrl}
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
        >
          {intl.formatMessage({ id: 'buy-ticket' })}
        </ExternalLink>
      )}
    </div>
  );
}

TicketInformation.propTypes = {
  fares: PropTypes.arrayOf(
    PropTypes.shape({
      cents: PropTypes.number.isRequired,
      components: PropTypes.arrayOf(
        PropTypes.shape({
          cents: PropTypes.number.isRequired,
          fareId: PropTypes.string.isRequired,
          routes: PropTypes.arrayOf(
            PropTypes.shape({
              agency: PropTypes.shape({
                fareUrl: PropTypes.string,
                gtfsId: PropTypes.string.isRequired,
                name: PropTypes.string,
              }).isRequired,
              gtfsId: PropTypes.string.isRequired,
            }),
          ),
        }),
      ),
      type: PropTypes.string.isRequired,
    }),
  ),
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      agency: PropTypes.shape({
        fareUrl: PropTypes.string,
        gtfsId: PropTypes.string.isRequired,
        name: PropTypes.string,
      }).isRequired,
      gtfsId: PropTypes.string.isRequired,
      longName: PropTypes.string.isRequired,
    }),
  ),
  zones: PropTypes.arrayOf(PropTypes.string),
};

TicketInformation.defaultProps = {
  fares: [],
  routes: [],
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
    <ComponentUsageExample description="single fare">
      <TicketInformation
        fares={[
          {
            type: 'regular',
            cents: 280,
            components: [{ fareId: 'HSL:AB', cents: 280 }],
          },
        ]}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="single fare, with agency fare url">
      <TicketInformation
        agencies={{
          foo: { id: 'foo', fareUrl: 'https://www.hsl.fi/liput-ja-hinnat' },
        }}
        fares={[
          {
            type: 'regular',
            cents: 280,
            components: [
              {
                cents: 280,
                fareId: 'HSL:AB',
                routes: [
                  {
                    agency: { id: 'foo' },
                  },
                ],
              },
            ],
          },
        ]}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="single fare, multiple options">
      <TicketInformation
        fares={[
          {
            type: 'regular',
            cents: 280,
            components: [{ fareId: 'HSL:AB', cents: 280 }],
          },
        ]}
        zones={['B']}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="multiple fares">
      <TicketInformation
        fares={[
          {
            type: 'regular',
            cents: 560,
            components: [
              { fareId: 'HSL:AB', cents: 280 },
              { fareId: 'HSL:BC', cents: 280 },
            ],
          },
        ]}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="unknown fare">
      <TicketInformation
        fares={[
          {
            type: 'regular',
            cents: -1,
            components: [{ fareId: 'HSL:ABC', cents: 460 }],
          },
        ]}
      />
    </ComponentUsageExample>
  </div>
);
