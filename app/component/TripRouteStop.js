import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import TripLink from './TripLink';
import FuzzyTripLink from './FuzzyTripLink';
import AddressRow from './AddressRow';
import ServiceAlertIcon from './ServiceAlertIcon';
import { fromStopTime } from './DepartureTime';
import { PREFIX_STOPS } from '../util/path';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import { estimateItineraryDistance } from '../util/geo-utils';
import ZoneIcon from './ZoneIcon';
import { getZoneLabel } from '../util/legUtils';
import getVehicleState from '../util/vehicleStateUtils';
import { VehicleShape } from '../util/shapes';

const TripRouteStop = (props, { config }) => {
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
    prevStop,
  } = props;

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
    const linkProps = {
      stopName: vehicleState === 'arriving' ? prevStop?.name : stop.name,
      nextStopName: vehicleState === 'arriving' ? stop?.name : nextStop?.name,
      key: vehicle.id,
      mode,
      pattern: props.pattern,
      route: props.route,
      vehicleNumber: vehicle.shortName || shortName,
      selected:
        props.selectedVehicle && props.selectedVehicle.id === vehicle.id,
      color: !stopPassed ? vehicle.color : '',
      setHumanScrolling,
      keepTracking,
      vehicleState,
    };
    return (
      <div className={cx('route-stop-now', vehicleState)}>
        {vehicle.tripId ? (
          <TripLink
            key={vehicle.id}
            shortName={shortName}
            vehicle={vehicle}
            {...linkProps}
          />
        ) : (
          <FuzzyTripLink key={vehicle.id} vehicle={vehicle} {...linkProps} />
        )}
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
        <Link
          as="button"
          type="button"
          to={`/${PREFIX_STOPS}/${encodeURIComponent(stop.gtfsId)}`}
        >
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
  vehicles: PropTypes.arrayOf(VehicleShape),
  mode: PropTypes.string.isRequired,
  color: PropTypes.string,
  stopPassed: PropTypes.bool.isRequired,
  stop: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string,
    desc: PropTypes.string,
    gtfsId: PropTypes.string,
    alerts: PropTypes.arrayOf(
      PropTypes.shape({
        severityLevel: PropTypes.string,
        validityPeriod: PropTypes.shape({
          startTime: PropTypes.number,
          endTime: PropTypes.number,
        }),
      }),
    ),
    zoneId: PropTypes.string,
  }).isRequired,
  nextStop: PropTypes.shape({
    name: PropTypes.string,
  }),
  prevStop: PropTypes.shape({
    name: PropTypes.string,
  }),
  stoptime: PropTypes.shape({
    realtimeDeparture: PropTypes.number,
    realtimeArrival: PropTypes.number,
    serviceDay: PropTypes.number,
  }).isRequired,
  currentTime: PropTypes.number.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  className: PropTypes.string,
  selectedVehicle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.oneOf([false]),
  ]).isRequired,
  shortName: PropTypes.string,
  setHumanScrolling: PropTypes.func.isRequired,
  keepTracking: PropTypes.bool,
  first: PropTypes.bool,
  last: PropTypes.bool,
};

TripRouteStop.defaultProps = {
  keepTracking: false,
  className: undefined,
  color: null,
  first: false,
  last: false,
  vehicles: [],
  nextStop: null,
  prevStop: null,
  shortName: undefined,
};

TripRouteStop.contextTypes = {
  config: PropTypes.object.isRequired,
};

TripRouteStop.displayName = 'TripRouteStop';

export default TripRouteStop;
