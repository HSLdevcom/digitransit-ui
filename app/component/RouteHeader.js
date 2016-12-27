import React from 'react';
import { Link } from 'react-router';
import cx from 'classnames';

import RouteNumber from './RouteNumber';

export default function RouteHeader(props) {
  const mode = props.route.mode.toLowerCase();

  const trip = props.trip ?
    (<span className="route-header-trip">
      {props.trip.substring(0, 2)}:{props.trip.substring(2, 4)} →
    </span>) : '';

  const routeLineText = ` ${props.route.shortName || ''}`;

  const routeLine = props.trip ?
    (<Link to={`/linjat/${props.route.gtfsId}/pysakit/${props.pattern.code}`}>
      {routeLineText}
    </Link>) : routeLineText;

  return (
    <div className={cx('route-header', props.className)}>
      <h1 className={mode}>
        <RouteNumber mode={mode} text={routeLine} />
        {trip}
      </h1>
    </div>);
}

RouteHeader.propTypes = {
  route: React.PropTypes.object.isRequired,
  trip: React.PropTypes.string,
  pattern: React.PropTypes.object.isRequired,
  className: React.PropTypes.string,
  favourite: React.PropTypes.bool.isRequired,
};
