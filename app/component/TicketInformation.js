import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import ExternalLink from './ExternalLink';
import { renderZoneTicketIcon, isWithinZoneB } from './ZoneTicketIcon';
import mapFares from '../util/fareUtils';

const getAgency = (routes, agencies) => {
  const agencyId =
    Array.isArray(routes) &&
    routes.length > 0 &&
    routes[0].agency &&
    routes[0].agency.id;
  if (!agencyId) {
    return undefined;
  }
  return (agencies && agencies[agencyId]) || undefined;
};

export default function TicketInformation(
  { agencies, fares, zones },
  { config, intl },
) {
  const mappedFares = mapFares(fares, config, intl.locale);
  if (!mappedFares) {
    return null;
  }

  const isMultiComponent = mappedFares.length > 1;
  const isOnlyZoneB = isWithinZoneB(zones, mappedFares);

  return (
    <div className="row itinerary-ticket-information">
      <div className="itinerary-ticket-type">
        <div className="ticket-type-title">
          Reitillä tarvittavat liput:
          {/* <FormattedMessage
              id="itinerary-tickets.title"
              defaultMessage="Required tickets"
            /> */}
        </div>
        {mappedFares
          .map(component => ({
            ...component,
            agency: getAgency(component.routes, agencies),
          }))
          .map((component, i) => (
            <div
              className={cx('ticket-type-zone', {
                'multi-component': isMultiComponent,
              })}
              key={i} // eslint-disable-line react/no-array-index-key
            >
              <div>
                {config.useTicketIcons ? (
                  renderZoneTicketIcon(component.ticketName, isOnlyZoneB)
                ) : (
                  <span>{component.ticketName}</span>
                )}
                <span>
                  {`${intl.formatMessage({ id: 'ticket-single-adult' })}, ${(
                    component.cents / 100
                  ).toFixed(2)} €`}
                </span>
              </div>
              {component.agency && (
                <div className="ticket-type-agency-link">
                  <ExternalLink
                    className="itinerary-ticket-external-link"
                    href={component.agency.fareUrl}
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
  agencies: PropTypes.object,
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
                id: PropTypes.string.isRequired,
              }).isRequired,
            }),
          ),
        }),
      ),
      type: PropTypes.string.isRequired,
    }),
  ),
  zones: PropTypes.arrayOf(PropTypes.string),
};

TicketInformation.defaultProps = {
  agencies: {},
  fares: [],
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
