import React from 'react';
import { Link } from 'react-router';
import cx from 'classnames';

import ComponentUsageExample from './ComponentUsageExample';
import WalkDistance from './WalkDistance';
import StopCode from './StopCode';
import PatternLink from './PatternLink';
import { fromStopTime } from './DepartureTime';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
  vehicle as exampleVehicle,
} from './ExampleData';

const getRouteStopSvg = (first, last) => (
  <svg className="route-stop-schematized" >
    <line
      x1="6"
      x2="6"
      y1={first ? 13 : 0}
      y2={last ? 13 : 67}
      strokeWidth="5"
      stroke="currentColor"
    />
    <line
      x1="6"
      x2="6"
      y1={first ? 13 : 0}
      y2={last ? 13 : 67}
      strokeWidth="2"
      stroke="white"
      opacity="0.2"
    />
    <circle strokeWidth="2" stroke="currentColor" fill="white" cx="6" cy="13" r="5" />
  </svg>
);

const TripRouteStop = (props) => {
  const vehicles = props.vehicles && props.vehicles.map(
      vehicle => (<PatternLink
        key={vehicle.id}
        mode={vehicle.mode}
        pattern={props.pattern}
        route={props.route}
        selected={props.selectedVehicle && props.selectedVehicle.id === vehicle.id}
        fullscreenMap={props.fullscreenMap}
      />
    ),
  );

  return (
    <div className={cx('route-stop row', { passed: props.stopPassed }, props.className)}>
      <div className="columns route-stop-now">{vehicles}</div>
      <Link to={`/pysakit/${props.stop.gtfsId}`}>
        <div className={`columns route-stop-name ${props.mode}`}>
          {getRouteStopSvg(props.first, props.last)}
          {props.stop.name}
          <br />
          <div style={{ whiteSpace: 'nowrap' }}>
            {props.stop.code && <StopCode code={props.stop.code} />}
            <span className="route-stop-address">{props.stop.desc}</span>
            {'\u2002'}
            {props.distance &&
              <WalkDistance
                className="nearest-route-stop"
                icon="icon_location-with-user"
                walkDistance={props.distance}
              />
            }
          </div>
        </div>
        <div className="columns route-stop-time">
          {props.stoptime && fromStopTime(props.stoptime, props.currentTime)}
        </div>
      </Link>
      <div className="route-stop-row-divider" />
    </div>
  );
};

TripRouteStop.propTypes = {
  vehicles: React.PropTypes.array,
  mode: React.PropTypes.string.isRequired,
  stopPassed: React.PropTypes.bool,
  realtimeDeparture: React.PropTypes.number,
  stop: React.PropTypes.object.isRequired,
  distance: React.PropTypes.oneOfType([
    React.PropTypes.number,
    React.PropTypes.oneOf([false]),
  ]).isRequired,
  stoptime: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
  pattern: React.PropTypes.string.isRequired,
  route: React.PropTypes.string.isRequired,
  className: React.PropTypes.string,
  selectedVehicle: React.PropTypes.oneOfType([
    React.PropTypes.object,
    React.PropTypes.oneOf([false]),
  ]).isRequired,
  first: React.PropTypes.bool,
  last: React.PropTypes.bool,
  fullscreenMap: React.PropTypes.bool,
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
        mode={exampleDeparture.pattern.route.mode}
        route={exampleDeparture.pattern.route.gtfsId}
        pattern={exampleDeparture.pattern.code}
        vehicles={null}
        stopPassed
        realtime={exampleDeparture.realtime}
        distance={321}
        realtimeDeparture={null}
        stoptime={exampleDeparture}
        currentTime={exampleCurrentTime}
        selectedVehicle={false}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="Realtime with vehicle info:">
      <TripRouteStop
        key={exampleRealtimeDeparture.stop.gtfsId}
        stop={exampleRealtimeDeparture.stop}
        mode={exampleRealtimeDeparture.pattern.route.mode}
        pattern={exampleDeparture.pattern.code}
        route={exampleDeparture.pattern.route.gtfsId}
        vehicles={[exampleVehicle]}
        stopPassed={false}
        realtime={exampleRealtimeDeparture.realtime}
        distance={231}
        realtimeDeparture={exampleRealtimeDeparture.realtimeDeparture}
        stoptime={exampleRealtimeDeparture}
        currentTime={exampleCurrentTime}
        selectedVehicle={exampleVehicle}
      />
    </ComponentUsageExample>
  </div>);

export default TripRouteStop;
