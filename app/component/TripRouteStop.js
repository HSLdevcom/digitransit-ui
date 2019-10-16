import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import cx from 'classnames';

import ComponentUsageExample from './ComponentUsageExample';
import WalkDistance from './WalkDistance';
import ServiceAlertIcon from './ServiceAlertIcon';
import StopCode from './StopCode';
import PatternLink from './PatternLink';
import { fromStopTime } from './DepartureTime';
import { RealtimeStateType, AlertSeverityLevelType } from '../constants';
import { PREFIX_STOPS } from '../util/path';
import {
  currentTime as exampleCurrentTime,
  departure as exampleDeparture,
  realtimeDeparture as exampleRealtimeDeparture,
  vehicle as exampleVehicle,
} from './ExampleData';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';

const TripRouteStop = props => {
  const {
    className,
    color,
    currentTime,
    distance,
    mode,
    stop,
    stopPassed,
    stoptime,
  } = props;

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
      />
    ));

  return (
    <div
      className={cx(
        'route-stop location-details_container',
        { passed: stopPassed },
        className,
      )}
    >
      <div className=" route-stop-now">{vehicles}</div>
      <div className={cx('route-stop-now_circleline', mode)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={15}
          height={30}
          style={{ fill: color, stroke: color }}
        >
          <circle
            strokeWidth="2"
            stroke={color || 'currentColor'}
            fill="white"
            cx="6"
            cy="13"
            r="5"
          />
        </svg>
        <div className={cx('route-stop-now_line', mode)} />
      </div>
      <div className="route-stop-row_content-container">
        <Link to={`/${PREFIX_STOPS}/${encodeURIComponent(stop.gtfsId)}`}>
          <div className={`route-details_container ${mode}`}>
            <div>
              <span>{stop.name}</span>
              <ServiceAlertIcon
                className="inline-icon"
                severityLevel={getActiveAlertSeverityLevel(
                  stop.alerts,
                  currentTime,
                )}
              />
            </div>
            <div>
              {stop.code && <StopCode code={stop.code} />}
              <span className="route-stop-address">{stop.desc}</span>
              {'\u2002'}
              {distance && (
                <WalkDistance
                  className="nearest-route-stop"
                  icon="icon_location-with-user"
                  walkDistance={distance}
                />
              )}
            </div>
          </div>
          <div className="departure-times-container">
            <div className="route-stop-time">
              {stoptime && fromStopTime(stoptime, currentTime)}
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
    <ComponentUsageExample description="With info:">
      <TripRouteStop
        key={exampleDeparture.stop.gtfsId}
        stop={{
          ...exampleDeparture.stop,
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Info,
            },
          ],
        }}
        mode={exampleDeparture.pattern.route.mode}
        route={exampleDeparture.pattern.route.gtfsId}
        pattern={exampleDeparture.pattern.code}
        vehicles={null}
        realtime={false}
        distance={321}
        stoptime={exampleDeparture}
        currentTime={exampleCurrentTime}
        selectedVehicle={false}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="With caution:">
      <TripRouteStop
        key={exampleDeparture.stop.gtfsId}
        stop={{
          ...exampleDeparture.stop,
          alerts: [
            {
              alertSeverityLevel: AlertSeverityLevelType.Warning,
            },
          ],
        }}
        mode={exampleDeparture.pattern.route.mode}
        route={exampleDeparture.pattern.route.gtfsId}
        pattern={exampleDeparture.pattern.code}
        vehicles={null}
        realtime={false}
        distance={321}
        currentTime={exampleCurrentTime}
        selectedVehicle={false}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="With cancelation:">
      <TripRouteStop
        key={exampleDeparture.stop.gtfsId}
        stop={exampleDeparture.stop}
        mode={exampleDeparture.pattern.route.mode}
        route={exampleDeparture.pattern.route.gtfsId}
        pattern={exampleDeparture.pattern.code}
        vehicles={null}
        realtime={false}
        distance={321}
        stoptime={{
          ...exampleDeparture,
          realtimeState: RealtimeStateType.Canceled,
          scheduledDeparture: 69900,
        }}
        currentTime={exampleCurrentTime}
        selectedVehicle={false}
      />
    </ComponentUsageExample>
  </div>
);

export default TripRouteStop;
