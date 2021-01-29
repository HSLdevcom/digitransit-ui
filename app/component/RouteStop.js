import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';

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
    last: PropTypes.bool,
    displayNextDeparture: PropTypes.bool,
    shortName: PropTypes.string,
  };

  static defaultProps = {
    displayNextDeparture: true,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
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

  getDepartureTime(stoptime, currentTime) {
    const { config, intl } = this.context;
    let departureText = '';
    if (stoptime) {
      const departureTime =
        stoptime.serviceDay +
        (stoptime.realtimeState === 'CANCELED' ||
        stoptime.realtimeDeparture === -1
          ? stoptime.scheduledDeparture
          : stoptime.realtimeDeparture);
      const timeDiffInMinutes = Math.floor((departureTime - currentTime) / 60);
      if (
        timeDiffInMinutes < 0 ||
        timeDiffInMinutes > config.minutesToDepartureLimit
      ) {
        const date = new Date(departureTime * 1000);
        departureText = `${
          (date.getHours() < 10 ? '0' : '') + date.getHours()
        }:${date.getMinutes()}`;
      } else if (timeDiffInMinutes === 0) {
        departureText = intl.formatMessage({
          id: 'arriving-soon',
          defaultMessage: 'Now',
        });
      } else {
        departureText = intl.formatMessage(
          { id: 'departure-time-in-minutes', defaultMessage: '{minutes} min' },
          { minutes: timeDiffInMinutes },
        );
      }
    }
    return departureText;
  }

  getText(stop, patternExists, displayNextDeparture, currentTime) {
    const { intl } = this.context;
    let text = intl.formatMessage({ id: 'stop' });
    text += ` ${stop.name},`;
    text += `${stop.code},`;
    text += `${stop.desc},`;
    if (patternExists) {
      text += `${intl.formatMessage({ id: 'leaves' })},`;
      text += `${this.getDepartureTime(
        stop.stopTimesForPattern[0],
        currentTime,
      )},`;
      if (displayNextDeparture) {
        text += `${intl.formatMessage({ id: 'next' })},`;
        text += `${this.getDepartureTime(
          stop.stopTimesForPattern[1],
          currentTime,
        )},`;
      }
    }
    return text;
  }

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
      shortName,
    } = this.props;
    const patternExists =
      stop.stopTimesForPattern && stop.stopTimesForPattern.length > 0;

    let vehicleTripLink;

    if (vehicle) {
      vehicleTripLink = vehicle.tripId ? (
        <TripLink key={vehicle.id} vehicle={vehicle} shortName={shortName} />
      ) : (
        <FuzzyTripLink key={vehicle.id} vehicle={vehicle} />
      );
    }

    return (
      <div
        className={cx('route-stop location-details_container ', className)}
        ref={el => {
          this.element = el;
        }}
        role="listitem"
      >
        <div className="route-stop-now">{vehicleTripLink}</div>
        <div
          className={cx('route-stop-now_circleline', mode)}
          aria-hidden="true"
        >
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
          <div
            className={cx('route-stop-now_line', mode)}
            style={{ backgroundColor: color }}
          />
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
            aria-label={this.getText(
              stop,
              patternExists,
              displayNextDeparture,
              currentTime,
            )}
          >
            <div className="route-details-upper-row">
              <div className={` route-details_container ${mode}`}>
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
            </div>
            <div className="route-details-bottom-row">
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
          </Link>
        </div>
      </div>
    );
  }
}

export default RouteStop;
