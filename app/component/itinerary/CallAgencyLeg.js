import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { legShape } from '../../util/shapes';
import { legTimeStr } from '../../util/legUtils';
import Icon from '../Icon';
import StopCode from '../StopCode';
import LegAgencyInfo from './LegAgencyInfo';
import ItineraryCircleLine from './ItineraryCircleLine';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../../util/path';
import CallAgencyIcon from './CallAgencyIcon';

const stopCode = code => code && <StopCode code={code} />;

const CallAgencyLeg = ({ leg, index }) => {
  const firstLegClassName = index === 0 ? ' start' : '';
  const modeClassName = 'call';

  return (
    <div className="row itinerary-row">
      <div className="itinerary-call-agency-warning" />
      <div className="small-2 columns itinerary-time-column call">
        <Link
          onClick={e => e.stopPropagation()}
          to={
            `/${PREFIX_ROUTES}/${leg.route.gtfsId}/${PREFIX_STOPS}/${leg.trip.pattern.code}
            /${leg.trip.gtfsId}`
            // TODO: Create a helper function for generationg links
          }
        >
          <div className="itinerary-time-column-time">
            <span>{legTimeStr(leg.start)}</span>
          </div>
        </Link>
      </div>
      <ItineraryCircleLine index={index} modeClassName={modeClassName} />
      <div
        className={`small-9 columns itinerary-instruction-column ${firstLegClassName} ${modeClassName}`}
      >
        <div className="itinerary-leg-first-row">
          <div>
            {leg.from.name}
            {stopCode(leg.from.stop && leg.from.stop.code)}
          </div>
          <Icon img="icon-icon_show-on-map" className="itinerary-search-icon" />
        </div>
        <div className="itinerary-transit-leg-route call">
          <CallAgencyIcon />
          <span className="warning-message">
            <FormattedMessage
              id="warning-call-agency"
              values={{
                routeName: (
                  <span className="route-name">{leg.route.longName}</span>
                ),
              }}
              defaultMessage="Only on demand: {routeName}, which needs to be booked in advance."
            />
            {leg.route.desc ? (
              <div className="itinerary-warning-route-description">
                {leg.route.desc}
              </div>
            ) : (
              ''
            )}
            <div className="itinerary-warning-agency-container">
              <LegAgencyInfo leg={leg} />
            </div>
            {leg.route.agency.phone ? (
              <div className="call-button">
                <a href={`tel:${leg.route.agency.phone}`}>
                  <FormattedMessage
                    id="call"
                    defaultMessage="Call"
                    values={{ number: leg.route.agency.phone }}
                  />
                </a>
              </div>
            ) : (
              ''
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

CallAgencyLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
};

export default CallAgencyLeg;
