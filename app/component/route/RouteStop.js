import React from 'react';
import Relay from 'react-relay';
import Link from 'react-router/lib/Link';

import FuzzyTripRoute from './FuzzyTripRoute';
import TripLink from '../trip/TripLink';
import WalkDistance from '../itinerary/walk-distance';
import StopCode from '../itinerary/StopCode';
import { fromStopTime } from '../departure/DepartureTime';

const routeStopSvg = (
  <svg style={{ position: 'absolute', width: 12, height: 65, left: -14 }} >
    <line x1="6" x2="6" y1="6" y2="65" strokeWidth="4" stroke="currentColor" />
    <circle strokeWidth="2" stroke="currentColor" fill="white" cx="6" cy="6" r="5" />
  </svg>
);

const lastRouteStopSvg = (
  <svg style={{ position: 'absolute', width: 12, height: 12, left: -14 }} >
    <circle strokeWidth="2" stroke="currentColor" fill="white" cx="6" cy="6" r="5" />
  </svg>
);

const RouteStop = (props) => {
  const vehicles = props.vehicles && props.vehicles.map((vehicle) =>
      (<Relay.RootContainer
        key={vehicle.id}
        Component={TripLink}
        route={new FuzzyTripRoute({
          route: vehicle.route,
          direction: vehicle.direction,
          date: vehicle.operatingDay,
          time: vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
            vehicle.tripStartTime.substring(2, 4) * 60,
        })}
        renderFetched={data =>
          (<TripLink
            mode={vehicle.mode}
            {...data}
          />)
        }
      />)) || [];

  return (
    <div className="route-stop row">
      <div className="columns small-3 route-stop-now">{vehicles}</div>
      <Link to={`/pysakit/${props.stop.gtfsId}`}>
        <div className={`columns small-5 route-stop-name ${props.mode}`}>
          {props.last ? lastRouteStopSvg : routeStopSvg}
          {props.stop.name}&nbsp;
          {props.distance &&
            <WalkDistance
              className="nearest-route-stop"
              icon="icon_location-with-user"
              walkDistance={props.distance}
            />
          }
          <br />
          <StopCode code={props.stop.code} />
          <span className="route-stop-address">{props.stop.desc}</span>
        </div>
        {(
          props.stop.stopTimesForPattern && props.stop.stopTimesForPattern.length > 0 &&
          props.stop.stopTimesForPattern.map((stopTime) => (
            <div key={stopTime.scheduledDeparture} className="columns small-2 route-stop-time">
              {fromStopTime(stopTime, props.currentTime)}
            </div>
          )))}
      </Link>
    </div>);
};

RouteStop.propTypes = {
  vehicles: React.PropTypes.array,
  stop: React.PropTypes.object,
  mode: React.PropTypes.string,
  distance: React.PropTypes.number,
  currentTime: React.PropTypes.number.isRequired,
  last: React.PropTypes.bool,
};

export default RouteStop;
