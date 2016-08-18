import React from 'react';
import Relay from 'react-relay';
import FuzzyTripRoute from './FuzzyTripRoute';
import Link from 'react-router/lib/Link';
import TripLink from '../trip/TripLink';
import WalkDistance from '../itinerary/walk-distance';
import StopCode from '../itinerary/StopCode';
import { fromStopTime } from '../departure/DepartureTime';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

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

const RouteStop = ({ vehicles, stop, mode, distance, last, currentTime }) => {
  const vehicleTripLinks = vehicles && vehicles.map((vehicle) =>
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
      <div className="columns small-3 route-stop-now">{vehicleTripLinks}</div>
      <Link to={`/pysakit/${stop.gtfsId}`}>
        <div className={`columns small-9 route-stop-name ${mode}`}>
          <div className="row">
            <div className="columns small-8">
              {last ? lastRouteStopSvg : routeStopSvg}
              {stop.name}
            </div>
            {(stop.stopTimesForPattern && stop.stopTimesForPattern.length > 0 &&
              stop.stopTimesForPattern.map((stopTime) => (
                <div key={stopTime.scheduledDeparture} className="columns small-2 route-stop-time">
                  {fromStopTime(stopTime, currentTime)}
                </div>
              )))}
          </div>
          <div className="row">
            <div className="columns small-8">
              <StopCode code={stop.code} />
              <span className="route-stop-address">{stop.desc}</span>
            </div>
            <div className="columns small-2 route-stop-time">
              {distance && <WalkDistance
                className="nearest-route-stop"
                icon="icon_location-with-user"
                walkDistance={distance}
              />}
            </div><div className="columns small-2"></div>
          </div>
        </div>
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

RouteStop.description = (
  <ComponentUsageExample description="basic">
    <RouteStop
      stop={{ stopTimesForPattern: [{ realtime: true, realtimeState: 'UPDATED',
      realtimeDeparture: 48796, serviceDay: 1471467600, scheduledDeparture: 48780 },
     { realtime: false, realtimeState: 'SCHEDULED', realtimeDeparture: 49980,
       serviceDay: 1471467600, scheduledDeparture: 49980 }],
      gtfsId: 'HSL:1173101', lat: 60.198185699999726, lon: 24.940634400000118,
      name: 'Asemapäällikönkatu', desc: 'Ratamestarinkatu', code: '0663' }}
      mode="bus" distance={200} last={false} currentTime={1471515614}
    />
  </ComponentUsageExample>
);
export default RouteStop;
