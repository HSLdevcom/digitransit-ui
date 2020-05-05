import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames';

import TripRoute from '../route/TripRoute';
import FuzzyTripRoute from '../route/FuzzyTripRoute';
import TripLink from './TripLink';
import FuzzyTripLink from './FuzzyTripLink';
import WalkDistance from './WalkDistance';
import ServiceAlertIcon from './ServiceAlertIcon';
import StopCode from './StopCode';
import { fromStopTime } from './DepartureTime';
import ComponentUsageExample from './ComponentUsageExample';
import { AlertSeverityLevelType, RealtimeStateType } from '../constants';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import { PREFIX_STOPS } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const exampleStop = {
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
};

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
    displayNextDeparture: PropTypes.bool,
  };

  static defaultProps = {
    displayNextDeparture: true,
  };

  static description = () => (
    <React.Fragment>
      <ComponentUsageExample description="basic">
        <RouteStop
          stop={{ ...exampleStop }}
          mode="bus"
          distance={200}
          last={false}
          currentTime={1471515614}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="with info">
        <RouteStop
          stop={{
            ...exampleStop,
            alerts: [{ alertSeverityLevel: AlertSeverityLevelType.Info }],
          }}
          mode="bus"
          distance={200}
          last={false}
          currentTime={1471515614}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="with caution">
        <RouteStop
          stop={{
            ...exampleStop,
            alerts: [{ alertSeverityLevel: AlertSeverityLevelType.Warning }],
            stopTimesForPattern: [],
          }}
          mode="bus"
          distance={200}
          last={false}
          currentTime={1471515614}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="with cancelation">
        <RouteStop
          stop={{
            ...exampleStop,
            stopTimesForPattern: [
              {
                realtime: false,
                realtimeState: RealtimeStateType.Canceled,
                realtimeDeparture: 48796,
                serviceDay: 1471467600,
                scheduledDeparture: 48780,
              },
              {
                realtime: false,
                realtimeState: RealtimeStateType.Canceled,
                realtimeDeparture: 49980,
                serviceDay: 1471467600,
                scheduledDeparture: 49980,
              },
            ],
          }}
          mode="bus"
          distance={200}
          last={false}
          currentTime={1471515614}
        />
      </ComponentUsageExample>
    </React.Fragment>
  );

  render() {
    const {
      className,
      color,
      currentTime,
      distance,
      last,
      mode,
      stop,
      vehicle,
      displayNextDeparture,
    } = this.props;
    const patternExists =
      stop.stopTimesForPattern && stop.stopTimesForPattern.length > 0;

    const vehicleTripLink = vehicle && (
      <Relay.RootContainer
        key={vehicle.id}
        Component={vehicle.tripId ? TripLink : FuzzyTripLink}
        route={
          vehicle.tripId
            ? new TripRoute({
                id: vehicle.tripId,
              })
            : new FuzzyTripRoute({
                route: vehicle.route,
                direction: vehicle.direction,
                date: vehicle.operatingDay,
                time:
                  vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
                  vehicle.tripStartTime.substring(2, 4) * 60,
              })
        }
        renderFetched={data =>
          vehicle.tripId ? (
            <TripLink mode={vehicle.mode} {...data} />
          ) : (
            <FuzzyTripLink mode={vehicle.mode} {...data} />
          )
        }
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
          <Link
            to={`/${PREFIX_STOPS}/${encodeURIComponent(stop.gtfsId)}`}
            onClick={() => {
              addAnalyticsEvent({
                category: 'Routes',
                action: 'OpenStopViewFromRoute',
                name: null,
              });
            }}
          >
            <div className={` route-details_container ${mode}`}>
              <div>
                <span>{stop.name}</span>
                <ServiceAlertIcon
                  className="inline-icon"
                  severityLevel={getActiveAlertSeverityLevel(
                    stop.alerts,
                    currentTime,
                  )}
                />
                {patternExists &&
                  stop.stopTimesForPattern[0].pickupType === 'NONE' &&
                  !last && (
                    <span className="drop-off-container">
                      <span className="drop-off-stop-icon bus" />
                      <FormattedMessage
                        id="route-destination-arrives"
                        defaultMessage="Drop-off only"
                      />
                    </span>
                  )}
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
            {patternExists && (
              <div className="departure-times-container">
                {displayNextDeparture ? (
                  stop.stopTimesForPattern.map(stopTime => (
                    <div
                      key={stopTime.scheduledDeparture}
                      className="route-stop-time"
                    >
                      {fromStopTime(stopTime, currentTime)}
                    </div>
                  ))
                ) : (
                  <div
                    key={stop.stopTimesForPattern[0].scheduledDeparture}
                    className="route-stop-time"
                  >
                    {fromStopTime(stop.stopTimesForPattern[0], currentTime)}
                  </div>
                )}
              </div>
            )}
          </Link>
        </div>
      </div>
    );
  }
}

export default RouteStop;
