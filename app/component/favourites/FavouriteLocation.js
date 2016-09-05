import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router/lib/Link';

import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Icon from '../icon/icon';
import DepartureTime from '../departure/DepartureTime';
import RouteNumber from '../departure/RouteNumber';
import { favouriteLocation as favouriteLocationExample } from '../documentation/ExampleData';

const FavouriteLocation = ({ locationName, className, currentTime, departureTime,
  firstTransitLeg, favouriteLocationIconId, clickFavourite, lat, lon }) => {
  if (!locationName) {
    return (
      <Link
        to="/lisaa-suosikki"
        className="cursor-pointer no-decoration"
      >
        <div className={cx('new-favourite-button-content', className)}>
          <Icon img="icon-icon_plus" className="add-new-favourite-icon" />
          <p className="add-location-text">
            <FormattedMessage id="add-location" defaultMessage="Add location" />
          </p>
        </div>
      </Link>
    );
  }

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
        <Icon className="favourite-location-icon" img={favouriteLocationIconId} />
        <div className="favourite-location-name">{locationName}</div>
      </div>
      <div className="favourite-location-departure">{transitLeg}&nbsp;{departureTimeComponent}
      </div>
      <div className="favourite-edit-icon-click-area">
        <Icon className="favourite-edit-icon" img="icon-icon_edit" />
      </div>
    </div>
  );
};

FavouriteLocation.description = (
  <div>
    <p>Renders a favourite location component</p>
    <ComponentUsageExample description="first leg is with a bus">
      <FavouriteLocation
        clickFavourite={() => {}}
        locationName={favouriteLocationExample.locationName}
        favouriteLocationIconId="icon-icon_place"
        departureTime={favouriteLocationExample.departureTime}
        currentTime={favouriteLocationExample.currentTime}
        firstTransitLeg={favouriteLocationExample.firstTransitLeg}
      />
    </ComponentUsageExample>
  </div>
);

FavouriteLocation.propTypes = {
  addFavourite: React.PropTypes.func,
  clickFavourite: React.PropTypes.func,
  className: React.PropTypes.string,
  locationName: React.PropTypes.string,
  favouriteLocationIconId: React.PropTypes.string,
  departureTime: React.PropTypes.number,
  currentTime: React.PropTypes.number,
  firstTransitLeg: React.PropTypes.object,
  lat: React.PropTypes.number,
  lon: React.PropTypes.number,
};

FavouriteLocation.displayName = 'FavouriteLocation';

export default FavouriteLocation;
