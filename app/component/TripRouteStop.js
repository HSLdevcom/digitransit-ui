import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import AddressRow from './AddressRow';
import ServiceAlertIcon from './ServiceAlertIcon';
import PatternLink from './PatternLink';
import { fromStopTime } from './DepartureTime';
import { PREFIX_STOPS } from '../util/path';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import { estimateItineraryDistance } from '../util/geo-utils';
import ZoneIcon from './ZoneIcon';
import { getZoneLabel } from '../util/legUtils';
import getVehicleState from '../util/vehicleStateUtils';

const TripRouteStop = (props, context) => {
  const {
    className,
    color,
    currentTime,
    mode,
    stop,
    nextStop,
    stopPassed,
    stoptime,
    shortName,
    setHumanScrolling,
    keepTracking,
    first,
    last,
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

    const vehicleState = getVehicleState(
      distanceToStop,
      maxDistance,
      vehicleTime,
      arrivalTimeToStop,
      departureTimeFromStop,
      first,
      last,
    );
    return (
      <div className={cx('route-stop-now', vehicleState)}>
        <PatternLink
          stopName={stop.name}
          nextStopName={nextStop ? nextStop.name : null}
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
              <AddressRow desc={stop.desc} code={stop.code} />
              {config.zones.stops && stop.zoneId ? (
                <ZoneIcon
                  className="itinerary-zone-icon"
                  zoneId={getZoneLabel(stop.zoneId, config)}
                  showUnknown={false}
                />
              ) : (
                <div className="itinerary-zone-icon" />
              )}
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
  nextStop: PropTypes.object,
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
  first: PropTypes.bool,
  last: PropTypes.bool,
};

TripRouteStop.contextTypes = {
  config: PropTypes.object.isRequired,
};

TripRouteStop.displayName = 'TripRouteStop';

export default TripRouteStop;
