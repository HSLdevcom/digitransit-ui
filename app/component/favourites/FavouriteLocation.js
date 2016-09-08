import React from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router/lib/Link';

import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Icon from '../icon/icon';
import DepartureTime from '../departure/DepartureTime';
import RouteNumber from '../departure/RouteNumber';
import { favouriteLocation as favouriteLocationExample } from '../documentation/ExampleData';

const FavouriteLocation = (props) => {
  if (!props.locationName) {
    return (
      <Link
        to="/lisaa-suosikki"
        className="cursor-pointer no-decoration"
      >
        <div className={cx('new-favourite-button-content', props.className)}>
          <Icon img="icon-icon_plus" className="add-new-favourite-icon" />
          <p className="add-location-text">
            <FormattedMessage id="add-location" defaultMessage="Add location" />
          </p>
        </div>
      </Link>
    );
  }

  let departureTime;
  let firstTransitLeg;
  const timeIsNotPast = props.currentTime < props.departureTime;

  if (props.departureTime && timeIsNotPast) {
    departureTime = (
      <DepartureTime
        departureTime={props.departureTime}
        realtime={props.firstTransitLeg && props.firstTransitLeg.realTime}
        currentTime={props.currentTime}
        className="time--small"
      />
    );
  } else {
    departureTime =
      <div className="favourite-location-content-placeholder time--small">--:--</div>;
  }
  if (props.firstTransitLeg && props.firstTransitLeg.route) {
    firstTransitLeg = (
      <RouteNumber
        mode={props.firstTransitLeg.mode}
        realtime={props.firstTransitLeg.realTime}
        text={props.firstTransitLeg.route.shortName}
      />
    );
  }
  return (
    <div
      className={cx('favourite-location-content', props.className)}
      onClick={() => props.clickFavourite(props.locationName, props.lat, props.lon)}
    >
      <div className="favourite-location-arrival">
        <Icon className="favourite-location-icon" img={props.favouriteLocationIconId} />
        <div className="favourite-location-name">{props.locationName}</div>
      </div>
      <div className="favourite-location-departure">{firstTransitLeg}&nbsp;{departureTime}
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
