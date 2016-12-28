import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import cx from 'classnames';

import FuzzyTripRoute from './FuzzyTripRoute';
import TripLink from './TripLink';
import WalkDistance from './WalkDistance';
import StopCode from './StopCode';
import { fromStopTime } from './DepartureTime';
import ComponentUsageExample from './ComponentUsageExample';

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

const RouteStop = ({
  vehicles, stop, mode, distance, last, first, currentTime, className,
}) => {
  const vehicleTripLinks = vehicles && vehicles.map(vehicle => (
    <Relay.RootContainer
      key={vehicle.id}
      Component={TripLink}
      route={new FuzzyTripRoute({
        route: vehicle.route,
        direction: vehicle.direction,
        date: vehicle.operatingDay,
        time: (vehicle.tripStartTime.substring(0, 2) * 60 * 60) +
          (vehicle.tripStartTime.substring(2, 4) * 60),
      })}
      renderFetched={data =>
        (<TripLink
          mode={vehicle.mode}
          {...data}
        />)
      }
    />
  ));

  return (
    <div className={cx('route-stop row', className)}>
      <div className="columns route-stop-now">{vehicleTripLinks}</div>
      <Link to={`/pysakit/${stop.gtfsId}`}>
        <div className={`columns route-stop-name ${mode}`}>
          {getRouteStopSvg(first, last)}
          {stop.name}
          <br />
          <div style={{ whiteSpace: 'nowrap' }}>
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
        {(stop.stopTimesForPattern && stop.stopTimesForPattern.length > 0 &&
          stop.stopTimesForPattern.map(stopTime => (
            <div key={stopTime.scheduledDeparture} className="columns route-stop-time">
              {fromStopTime(stopTime, currentTime)}
            </div>
          ))
        )}
      </Link>
      <div className="route-stop-row-divider" />
    </div>);
};

RouteStop.propTypes = {
  vehicles: React.PropTypes.array,
  stop: React.PropTypes.object,
  mode: React.PropTypes.string,
  className: React.PropTypes.string,
  distance: React.PropTypes.number,
  currentTime: React.PropTypes.number.isRequired,
  first: React.PropTypes.bool,
  last: React.PropTypes.bool,
};

RouteStop.description = (
  <ComponentUsageExample description="basic">
    <RouteStop
      stop={{
        stopTimesForPattern: [{
          realtime: true,
          realtimeState: 'UPDATED',
          realtimeDeparture: 48796,
          serviceDay: 1471467600,
          scheduledDeparture: 48780,
        },
        {
          realtime: false,
          realtimeState: 'SCHEDULED',
          realtimeDeparture: 49980,
          serviceDay: 1471467600,
          scheduledDeparture: 49980,
        }],
        gtfsId: 'HSL:1173101',
        lat: 60.198185699999726,
        lon: 24.940634400000118,
        name: 'Asemapäällikönkatu',
        desc: 'Ratamestarinkatu',
        code: '0663',
      }}
      mode="bus"
      distance={200}
      last={false}
      currentTime={1471515614}
    />
  </ComponentUsageExample>
);
export default RouteStop;
