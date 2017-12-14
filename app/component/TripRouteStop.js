import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import cx from 'classnames';

import ComponentUsageExample from './ComponentUsageExample';
import WalkDistance from './WalkDistance';
import StopCode from './StopCode';
import PatternLink from './PatternLink';
import { fromStopTime } from './DepartureTime';
import { PREFIX_STOPS } from '../util/path';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
  vehicle as exampleVehicle,
} from './ExampleData';

const TripRouteStop = props => {
  const vehicles =
    props.vehicles &&
    props.vehicles.map(vehicle => (
      <PatternLink
        key={vehicle.id}
        mode={vehicle.mode}
        pattern={props.pattern}
        route={props.route}
        selected={
          props.selectedVehicle && props.selectedVehicle.id === vehicle.id
        }
        fullscreenMap={props.fullscreenMap}
      />
    ));

  return (
    <div
      className={cx(
        'route-stop location-details_container',
        { passed: props.stopPassed },
        props.className,
      )}
    >
      <div className=" route-stop-now">{vehicles}</div>
      <div className={cx('route-stop-now_circleline', props.mode)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={15}
          height={30}
          style={{ fill: props.color, stroke: props.color }}
        >
          <circle
            strokeWidth="2"
            stroke={props.color || 'currentColor'}
            fill="white"
            cx="6"
            cy="13"
            r="5"
          />
        </svg>
        <div className={cx('route-stop-now_line', props.mode)} />
      </div>
      <div className="route-stop-row_content-container">
        <Link to={`/${PREFIX_STOPS}/${props.stop.gtfsId}`}>
          <div className={`route-details_container ${props.mode}`}>
            <span>{props.stop.name}</span>
            <div>
              {props.stop.code && <StopCode code={props.stop.code} />}
              <span className="route-stop-address">{props.stop.desc}</span>
              {'\u2002'}
              {props.distance && (
                <WalkDistance
                  className="nearest-route-stop"
                  icon="icon_location-with-user"
                  walkDistance={props.distance}
                />
              )}
            </div>
          </div>
          <div className="departure-times-container">
            <div className=" route-stop-time">
              {props.stoptime &&
                fromStopTime(props.stoptime, props.currentTime)}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

TripRouteStop.propTypes = {
  vehicles: PropTypes.array,
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  stopPassed: PropTypes.bool,
  stop: PropTypes.object.isRequired,
  distance: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([false])])
    .isRequired,
  stoptime: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  className: PropTypes.string,
  selectedVehicle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([false]),
  ]).isRequired,
  fullscreenMap: PropTypes.bool,
};

TripRouteStop.displayName = 'TripRouteStop';

TripRouteStop.description = () => (
  <div>
    <p>
      Renders a row intended to for use in a trip route stop list. The row
      contains the information of a single stop along a certain route.
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
        stoptime={exampleRealtimeDeparture}
        currentTime={exampleCurrentTime}
        selectedVehicle={exampleVehicle}
      />
    </ComponentUsageExample>
  </div>
);

export default TripRouteStop;
