import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import cx from 'classnames';

import FuzzyTripRoute from './FuzzyTripRoute';
import TripLink from './TripLink';
import WalkDistance from './WalkDistance';
import StopCode from './StopCode';
import { fromStopTime } from './DepartureTime';
import { PREFIX_STOPS } from '../util/path';
import ComponentUsageExample from './ComponentUsageExample';

class RouteStop extends React.PureComponent {
  static propTypes = {
    color: PropTypes.string,
    vehicle: PropTypes.object,
    stop: PropTypes.object,
    mode: PropTypes.string,
    className: PropTypes.string,
    distance: PropTypes.number,
    currentTime: PropTypes.number.isRequired,
    first: PropTypes.bool,
    last: PropTypes.bool,
  };

  static description = () => (
    <ComponentUsageExample description="basic">
      <RouteStop
        stop={{
          stopTimesForPattern: [
            {
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
            },
          ],
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

  render() {
    const {
      vehicle,
      stop,
      mode,
      distance,
      currentTime,
      className,
      color,
    } = this.props;

    const vehicleTripLink = vehicle && (
      <Relay.RootContainer
        key={vehicle.id}
        Component={TripLink}
        route={
          new FuzzyTripRoute({
            route: vehicle.route,
            direction: vehicle.direction,
            date: vehicle.operatingDay,
            time:
              vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
              vehicle.tripStartTime.substring(2, 4) * 60,
          })
        }
        renderFetched={data => <TripLink mode={vehicle.mode} {...data} />}
      />
    );

    return (
      <div
        className={cx('route-stop location-details_container ', className)}
        ref={el => {
          this.element = el;
        }}
      >
        <div className="route-stop-now">{vehicleTripLink}</div>
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
          <Link to={`/${PREFIX_STOPS}/${stop.gtfsId}`}>
            <div className={` route-details_container ${mode}`}>
              <span>{stop.name}</span>
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
            {stop.stopTimesForPattern &&
              stop.stopTimesForPattern.length > 0 && (
                <div className="departure-times-container">
                  {stop.stopTimesForPattern.map(stopTime => (
                    <div
                      key={stopTime.scheduledDeparture}
                      className="route-stop-time"
                    >
                      {fromStopTime(stopTime, currentTime)}
                    </div>
                  ))}
                </div>
              )}
          </Link>
        </div>
      </div>
    );
  }
}

export default RouteStop;
