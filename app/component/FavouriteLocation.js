import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router';

import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';
import DepartureTime from './DepartureTime';
import RouteNumber from './RouteNumber';
import { favouriteLocation as favouriteLocationExample } from './ExampleData';

const FavouriteLocation = ({ favourite, className, currentTime, departureTime,
  firstTransitLeg, clickFavourite }) => {
  const { locationName, id, lat, lon, selectedIconId } = favourite;


  let departureTimeComponent;
  if (departureTime &&
      (currentTime < departureTime)) {  // Departure is in the future
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

  // Show either route number and when it departs from nearest stop,
  // or icon indicating that the itinerary is just walking.
  let info;
  if (firstTransitLeg && firstTransitLeg.route) {
    info = (
      <div className="favourite-location-departure">
        <RouteNumber
          mode={firstTransitLeg.mode}
          realtime={firstTransitLeg.realTime}
          text={firstTransitLeg.route.shortName}
        />
        &nbsp;
        {departureTimeComponent}
      </div>
    );
  } else {
    info = <Icon img="icon-icon_walk" viewBox="6 0 40 40" />;
  }

  return (
    <div
      data-swipeable="true"
      className={cx('favourite-location-content', className)}
      onClick={() => clickFavourite(locationName, lat, lon)}
    >
      <div className="favourite-location-arrival">
        <Icon className="favourite-location-icon" img={selectedIconId} />
        <div className="favourite-location-name">{locationName}</div>
      </div>

      {info}
      <Link
        onClick={(e) => { e.stopPropagation(); }}
        to={`/suosikki/muokkaa/${id}`}
        className="cursor-pointer no-decoration"
      >
        <div className="favourite-edit-icon-click-area">
          <Icon className="favourite-edit-icon" img="icon-icon_edit" />
        </div>
      </Link>
    </div>
  );
};

FavouriteLocation.description = () =>
  <div>
    <p>Renders a favourite location component</p>
    <ComponentUsageExample description="first leg is with a bus">
      <FavouriteLocation
        clickFavourite={() => {}}
        {...favouriteLocationExample}
      />
    </ComponentUsageExample>
  </div>;

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
