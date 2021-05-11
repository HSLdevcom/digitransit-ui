import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import ComponentUsageExample from './ComponentUsageExample';
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
import { estimateItineraryDistance } from '../util/geo-utils';
import ZoneIcon from './ZoneIcon';
import { getZoneLabel } from '../util/legUtils';

const VEHICLE_ARRIVING = 'arriving';
const VEHICLE_ARRIVED = 'arrived';
const VEHICLE_DEPARTED = 'departed';

const TripRouteStop = (props, context) => {
  const {
    className,
    color,
    currentTime,
    mode,
    stop,
    stopPassed,
    stoptime,
    shortName,
    setHumanScrolling,
    keepTracking,
  } = props;

  const { config } = context;

  const getVehiclePatternLink = vehicle => {
    const maxDistance = vehicle.mode === 'rail' ? 100 : 50;
    const { realtimeDeparture, realtimeArrival, serviceDay } = stoptime;
    const arrivalTimeToStop = (serviceDay + realtimeArrival) * 1000;
    const departureTimeFromStop = (serviceDay + realtimeDeparture) * 1000;
    const vehicleTime = vehicle.timestamp * 1000;
    const distanceToStop = estimateItineraryDistance(stop, {
      lat: vehicle.lat,
      lon: vehicle.long,
    });

    let vehicleState = '';
    if (distanceToStop > maxDistance && vehicleTime < arrivalTimeToStop) {
      vehicleState = VEHICLE_ARRIVING;
    } else if (
      (vehicleTime >= arrivalTimeToStop &&
        vehicleTime < departureTimeFromStop) ||
      distanceToStop <= maxDistance
    ) {
      vehicleState = VEHICLE_ARRIVED;
    } else if (vehicleTime >= departureTimeFromStop) {
      vehicleState = VEHICLE_DEPARTED;
    }
    return (
      <div className={cx('route-stop-now', vehicleState)}>
        <PatternLink
          key={vehicle.id}
          mode={vehicle.mode}
          pattern={props.pattern}
          route={props.route}
          vehicleNumber={vehicle.shortName || shortName}
          selected={
            props.selectedVehicle && props.selectedVehicle.id === vehicle.id
          }
          color={!stopPassed && vehicle.color}
          setHumanScrolling={setHumanScrolling}
          keepTracking={keepTracking}
        />
      </div>
    );
  };
  const vehicles =
    props.vehicles &&
    props.vehicles.map(
      vehicle =>
        vehicle.route === props.route && getVehiclePatternLink(vehicle),
    );
  return (
    <div
      className={cx(
        'route-stop location-details_container',
        { passed: stopPassed },
        className,
      )}
    >
      {vehicles}
      <div className={cx('route-stop-now_circleline', mode)}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fill: !stopPassed && color, stroke: !stopPassed && color }}
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="white"
            stroke={(!stopPassed && color) || 'currentColor'}
            strokeWidth="4"
          />
        </svg>
        <div
          className={cx('route-stop-now_line', mode)}
          style={{ backgroundColor: !stopPassed && color }}
        />
      </div>
      <div className="route-stop-row_content-container">
        <Link to={`/${PREFIX_STOPS}/${encodeURIComponent(stop.gtfsId)}`}>
          <div>
            <div className="route-details-upper-row">
              <div className={`route-details_container ${mode}`}>
                <div className="route-stop-name">
                  <span>{stop.name}</span>
                  <ServiceAlertIcon
                    className="inline-icon"
                    severityLevel={getActiveAlertSeverityLevel(
                      stop.alerts,
                      currentTime,
                    )}
                  />
                </div>
              </div>
              <div className="departure-times-container">
                <div className="route-stop-time">
                  {!isEmpty(stoptime) && fromStopTime(stoptime, currentTime)}
                </div>
              </div>
            </div>
            <div className="route-details-bottom-row">
              <span className="route-stop-address">{stop.desc}</span>
              {stop.code && <StopCode code={stop.code} />}
              <ZoneIcon
                zoneId={getZoneLabel(stop.zoneId, config)}
                showUnknown={false}
              />
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
  stoptime: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  className: PropTypes.string,
  selectedVehicle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([false]),
  ]).isRequired,
  shortName: PropTypes.string,
  setHumanScrolling: PropTypes.func,
  keepTracking: PropTypes.bool,
};

TripRouteStop.contextTypes = {
  config: PropTypes.object.isRequired,
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
        route={exampleRealtimeDeparture.pattern.route.gtfsId}
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
        stoptime={exampleDeparture}
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
