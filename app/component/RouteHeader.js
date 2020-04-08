import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import cx from 'classnames';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import RouteNumber from './RouteNumber';

export default function RouteHeader(props) {
  const mode = props.route.mode.toLowerCase();

  const trip = props.trip ? (
    <span className="route-header-trip">
      {props.trip.substring(0, 2)}:{props.trip.substring(2, 4)} →
    </span>
  ) : (
    ''
  );

  const routeLineText = ` ${props.route.shortName || ''}`;

  // DT-3331: added query string sort=no to Link's to
  const routeLine =
    props.trip && props.pattern ? (
      <Link
        to={`/${PREFIX_ROUTES}/${props.route.gtfsId}/${PREFIX_STOPS}/${
          props.pattern.code
        }?sort=no`}
      >
        {routeLineText}
      </Link>
    ) : (
      routeLineText
    );

  return (
    <div className={cx('route-header', props.className)}>
      <h1 className={mode}>
        <RouteNumber mode={mode} text={routeLine} gtfsId={props.route.gtfsId} />
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
  }).isRequired,
  trip: PropTypes.string,
  pattern: PropTypes.shape({ code: PropTypes.string.isRequired }),
  className: PropTypes.string,
};
