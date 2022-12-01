import React from 'react';
import cx from 'classnames';
import Link from 'found/Link';
import moment from 'moment';
import PropTypes from 'prop-types';
import { intlShape } from 'react-intl';
import { getRouteMode } from '../util/modeUtils';
import RouteNumber from './RouteNumber';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

const LegInfo = (
  { leg, hasNoShortName, headsign, alertSeverityLevel, isAlternativeLeg },
  { intl },
) => {
  const mode = getRouteMode({ mode: leg.mode, type: leg.route.type });
  return (
    <div
      className={cx('itinerary-transit-leg-route', {
        'long-name': hasNoShortName,
        'alternative-leg-suggestion': isAlternativeLeg,
      })}
    >
      <Link
        onClick={e => {
          e.stopPropagation();
        }}
        to={
          `/${PREFIX_ROUTES}/${leg.route.gtfsId}/${PREFIX_STOPS}/${leg.trip.pattern.code}/${leg.trip.gtfsId}`
          // TODO: Create a helper function for generationg links
        }
        aria-label={`${intl.formatMessage({
          id: mode.toLowerCase(),
          defaultMessage: 'Vehicle',
        })} ${leg.route && leg.route.shortName}`}
      >
        <span aria-hidden="true">
          <RouteNumber
            mode={mode.toLowerCase()}
            alertSeverityLevel={alertSeverityLevel}
            color={leg.route ? `#${leg.route.color}` : 'currentColor'}
            text={leg.route && leg.route.shortName}
            realtime={false}
            withBar
            fadeLong
          />
        </span>
      </Link>
      <div className="headsign">{headsign}</div>
      <span className="realtime">{moment(leg.startTime).format('HH:mm')}</span>
    </div>
  );
};

LegInfo.propTypes = {
  leg: PropTypes.object.isRequired,
  hasNoShortName: PropTypes.bool.isRequired,
  mode: PropTypes.string.isRequired,
  headsign: PropTypes.string.isRequired,
  alertSeverityLevel: PropTypes.object.isRequired,
  isAlternativeLeg: PropTypes.bool.isRequired,
};

LegInfo.contextTypes = {
  intl: intlShape.isRequired,
};

export default LegInfo;
