import React from 'react';
import Link from 'react-router/lib/Link';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import cx from 'classnames';
import WalkDistance from '../itinerary/walk-distance';
import StopCode from '../itinerary/StopCode';
import PatternLink from './PatternLink';
import { fromStopTime } from '../departure/DepartureTime';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
  vehicle as exampleVehicle,
} from '../documentation/ExampleData';

const TripRouteStop = (props) => {
  const vehicles = props.vehicles && props.vehicles.map(
      (vehicle) => (<PatternLink
        routeType={vehicle.mode}
        pattern={props.pattern}
        selected={props.selectedVehicle.id === vehicle.id}
      />)
    ) || [];

  return (
    <div className={cx('route-stop row', { passed: props.stopPassed })}>
      <div className="columns small-3 route-stop-now">{vehicles}</div>
      <Link to={`/pysakit/${props.stop.gtfsId}`}>
        <div className={`columns small-7 route-stop-name ${props.mode}`}>
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
          props.stoptime &&
          (<div>
            <div className="columns small-2 route-stop-time">
              {fromStopTime(props.stoptime, props.currentTime)}
            </div>
          </div>))}
      </Link>
    </div>);
};

TripRouteStop.propTypes = {
  vehicles: React.PropTypes.array.isRequired,
  mode: React.PropTypes.string,
  stopPassed: React.PropTypes.bool,
  realtimeDeparture: React.PropTypes.number,
  stop: React.PropTypes.object,
  distance: React.PropTypes.number,
  stoptime: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
  pattern: React.PropTypes.string,
  selectedVehicle: React.PropTypes.object.isRequired,
};

TripRouteStop.description = (
  <div>
    <p>
      Renders a row intended to for use in a trip route stop list.
      The row contains the information of a single stop along a certain route.
    </p>
    <ComponentUsageExample description="Not realtime, no vehicle info:">
      <TripRouteStop
        key={exampleDeparture.stop.gtfsId}
        stop={exampleDeparture.stop}
        mode={exampleDeparture.pattern.route.type}
        vehicle={null}
        stopPassed
        realtime={exampleDeparture.realtime}
        distance={321}
        realtimeDeparture={null}
        currentTimeFromMidnight={exampleCurrentTime}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="Realtime with vehicle info:">
      <TripRouteStop
        key={exampleRealtimeDeparture.stop.gtfsId}
        stop={exampleRealtimeDeparture.stop}
        mode={exampleRealtimeDeparture.pattern.route.type}
        vehicle={exampleVehicle}
        stopPassed={false}
        realtime={exampleRealtimeDeparture.realtime}
        distance={231}
        realtimeDeparture={exampleRealtimeDeparture.realtimeDeparture}
        currentTimeFromMidnight={exampleCurrentTime}
      />
    </ComponentUsageExample>
  </div>);

export default TripRouteStop;
