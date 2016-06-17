import React from 'react';
import Icon from '../icon/icon';
import Link from 'react-router/lib/Link';
import RouteNumber from '../departure/RouteNumber';
import Favourite from '../favourites/Favourite';
import cx from 'classnames';

export default function RouteHeader(props) {
  const mode = props.route.type.toLowerCase();

  const trip = props.trip ?
    (<span className="route-header-trip">
      {props.trip.substring(0, 2)}:{props.trip.substring(2, 4)} →
    </span>) : '';

  const headerText = props.trip ? '' :
    (<div className="route-header-name">
      {props.route.longName}
    </div>);

  const routeLineText = ` ${props.route.shortName || ''}`;

  const routeLine = props.trip ?
    (<Link to={`/linjat/${props.pattern.code}`}>
      {routeLineText}
    </Link>) : routeLineText;

  const reverse = (props.reverseId && !props.trip) ?
    (<Link to={`/linjat/${props.reverseId}`}>
      <Icon className={`route-header-direction-switch ${mode}`} img="icon-icon_direction-b" />
    </Link>) : null;

  return (
    <div className={cx('route-header', props.className)}>
      <h1 className={mode}>
        <RouteNumber mode={mode} text={routeLine} />
        {trip}
      </h1>
      {headerText}
      <div className="route-header-direction">
        {props.pattern ? `${props.pattern.stops[0].name} ` : ' '}
        <Icon className={mode} img="icon-icon_arrow-right" />
        {props.pattern ? ` ${props.pattern.headsign}` : ' '}
        {reverse}
      </div>
      <Favourite addFavourite={props.addFavouriteRoute} favourite={props.favourite} />
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
