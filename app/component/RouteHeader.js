import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { convertTo24HourFormat } from '../util/timeUtils';
import RouteNumber from './RouteNumber';
import { getRouteMode } from '../util/modeUtils';

export default function RouteHeader({ route, pattern, card, trip, className }) {
  const mode = getRouteMode(route);

  let tripEl;
  if (trip && trip.length > 3) {
    // change to 24h format
    const startTime = convertTo24HourFormat(trip);
    tripEl = <span className="route-header-trip">{startTime} →</span>;
  } else {
    tripEl = '';
  }

  const routeLineText = ` ${route.shortName || ''}`;

  const routeLine =
    trip && pattern ? (
      <Link
        to={`/${PREFIX_ROUTES}/${route.gtfsId}/${PREFIX_STOPS}/${pattern.code}`}
      >
        {routeLineText}
      </Link>
    ) : (
      routeLineText
    );

  return (
    <div className={cx('route-header', className)}>
      <h1 className={mode}>
        <RouteNumber
          card={card}
          mode={mode}
          text={routeLine}
          color={route.color ? `#${route.color}` : 'currentColor'}
        />
        {tripEl}
      </h1>
    </div>
  );
}

RouteHeader.propTypes = {
  route: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
  trip: PropTypes.string,
  pattern: PropTypes.shape({ code: PropTypes.string.isRequired }),
  className: PropTypes.string,
  card: PropTypes.bool,
};
