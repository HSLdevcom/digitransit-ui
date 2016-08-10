import React from 'react';
import Relay from 'react-relay';
import FuzzyTripRoute from './FuzzyTripRoute';
import Link from 'react-router/lib/Link';
import TripLink from '../trip/TripLink';
import WalkDistance from '../itinerary/walk-distance';
import StopCode from '../itinerary/StopCode';
import { fromStopTime } from '../departure/DepartureTime';

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
};

export default RouteStop;
