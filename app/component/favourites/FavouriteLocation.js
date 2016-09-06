import React from 'react';
import cx from 'classnames';
import Link from 'react-router/lib/Link';

import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Icon from '../icon/icon';
import DepartureTime from '../departure/DepartureTime';
import RouteNumber from '../departure/RouteNumber';
import { favouriteLocation as favouriteLocationExample } from '../documentation/ExampleData';

const FavouriteLocation = ({ favourite, className, currentTime, departureTime,
  firstTransitLeg, clickFavourite }) => {
  const { locationName, id, lat, lon, selectedIconId } = favourite;

  let departureTimeComponent;
  let transitLeg;
  const timeIsNotPast = currentTime < departureTime;

  if (departureTime && timeIsNotPast) {
    departureTimeComponent = (
      <DepartureTime
        departureTime={departureTime}
        realtime={firstTransitLeg && firstTransitLeg.realTime}
        currentTime={currentTime}
        className="time--small"
      />
    );
  } else {
    departureTimeComponent =
      <div className="favourite-location-content-placeholder time--small">--:--</div>;
  }
  if (firstTransitLeg && firstTransitLeg.route) {
    transitLeg = (
      <RouteNumber
        mode={firstTransitLeg.mode}
        realtime={firstTransitLeg.realTime}
        text={firstTransitLeg.route.shortName}
      />
    );
  }
  return (
    <div
      className={cx('favourite-location-content', className)}
      onClick={() => clickFavourite(locationName, lat, lon)}
    >
      <div className="favourite-location-arrival">
        <Icon className="favourite-location-icon" img={selectedIconId} />
        <div className="favourite-location-name">{locationName}</div>
      </div>
      <div className="favourite-location-departure">{transitLeg}&nbsp;{departureTimeComponent}
      </div>
      <Link
        onClick={(e) => { e.stopPropagation(); }}
        to={`/suosikki/muokkaa/${id}`}
        className="cursor-pointer no-decoration"
      ><div className="favourite-edit-icon-click-area" >
        <Icon className="favourite-edit-icon" img="icon-icon_edit" />
      </div>
      </Link>
    </div>
  );
};

FavouriteLocation.description = (
  <div>
    <p>Renders a favourite location component</p>
    <ComponentUsageExample description="first leg is with a bus">
      <FavouriteLocation
        clickFavourite={() => {}}
        {...favouriteLocationExample}
      />
    </ComponentUsageExample>
  </div>
);

FavouriteLocation.propTypes = {
  favourite: React.PropTypes.object,
  addFavourite: React.PropTypes.func,
  clickFavourite: React.PropTypes.func,
  className: React.PropTypes.string,
  departureTime: React.PropTypes.number,
  currentTime: React.PropTypes.number,
  firstTransitLeg: React.PropTypes.object,
};

FavouriteLocation.displayName = 'FavouriteLocation';

export default FavouriteLocation;
