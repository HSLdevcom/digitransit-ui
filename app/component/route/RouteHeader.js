import React from 'react';
import Link from 'react-router/lib/Link';
import RouteNumber from '../departure/RouteNumber';
import cx from 'classnames';

export default function RouteHeader(props) {
  const mode = props.route.type.toLowerCase();

  const trip = props.trip ?
    (<span className="route-header-trip">
      {props.trip.substring(0, 2)}:{props.trip.substring(2, 4)} →
    </span>) : '';

  const routeLineText = ` ${props.route.shortName || ''}`;

  const routeLine = props.trip ?
    (<Link to={`/linjat/${props.pattern.code}`}>
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
  trip: React.PropTypes.object,
  pattern: React.PropTypes.object.isRequired,
  reverseId: React.PropTypes.string,
  className: React.PropTypes.string,
  addFavouriteRoute: React.PropTypes.func.isRequired,
  favourite: React.PropTypes.bool.isRequired,
};
