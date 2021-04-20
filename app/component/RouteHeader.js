import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { convertTo24HourFormat } from '../util/timeUtils';
import RouteNumber from './RouteNumber';

export default function RouteHeader(props) {
  const mode = props.route.mode.toLowerCase();

  let trip;
  if (props.trip && props.trip.length > 3) {
    // change to 24h format
    const startTime = convertTo24HourFormat(props.trip);
    trip = <span className="route-header-trip">{startTime} →</span>;
  } else {
    trip = '';
  }

  const routeLineText = ` ${props.route.shortName || ''}`;

  const routeLine =
    props.trip && props.pattern ? (
      <Link
        to={`/${PREFIX_ROUTES}/${props.route.gtfsId}/${PREFIX_STOPS}/${props.pattern.code}`}
      >
        {routeLineText}
      </Link>
    ) : (
      routeLineText
    );

  return (
    <div className={cx('route-header', props.className)}>
      <h1 className={mode}>
        <RouteNumber
          card={props.card}
          mode={mode}
          text={routeLine}
          color={props.route.color ? `#${props.route.color}` : 'currentColor'}
        />
        {trip}
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
