import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import AddressRow from './AddressRow';
import TripLink from './TripLink';
import FuzzyTripLink from './FuzzyTripLink';
import ServiceAlertIcon from './ServiceAlertIcon';
import { fromStopTime } from './DepartureTime';
import ZoneIcon from './ZoneIcon';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import { PREFIX_STOPS } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { getZoneLabel } from '../util/legUtils';
import { estimateItineraryDistance } from '../util/geo-utils';
import getVehicleState from '../util/vehicleStateUtils';
import Icon from './Icon';

const RouteStop = (
  {
    className,
    color,
    currentTime,
    first,
    last,
    mode,
    stop,
    nextStop,
    vehicle,
    displayNextDeparture,
    shortName,
  },
  { config, intl },
) => {
  const patternExists =
    stop.stopTimesForPattern && stop.stopTimesForPattern.length > 0;

  const firstDeparture = patternExists && stop.stopTimesForPattern[0];
  const nextDeparture = patternExists && stop.stopTimesForPattern[1];

  const getDepartureTime = stoptime => {
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
  };

  const getText = () => {
    let text = intl.formatMessage({ id: 'stop' });
    text += ` ${stop.name},`;
    text += `${stop.code},`;
    text += `${stop.desc},`;

    if (getActiveAlertSeverityLevel(stop.alerts, currentTime)) {
      text += `${intl.formatMessage({
        id: 'disruptions-tab.sr-disruptions',
      })},`;
    }

    if (patternExists) {
      text += `${intl.formatMessage({ id: 'leaves' })},`;
      text += `${getDepartureTime(stop.stopTimesForPattern[0])},`;
      if (stop.stopTimesForPattern[0].stop.platformCode) {
        text += `${intl.formatMessage({ id: 'platform' })},`;
        text += `${stop.stopTimesForPattern[0].stop.platformCode},`;
      }
      if (displayNextDeparture) {
        text += `${intl.formatMessage({ id: 'next' })},`;
        text += `${getDepartureTime(
          stop.stopTimesForPattern[1],
          currentTime,
        )},`;
        if (
          stop.stopTimesForPattern[1] &&
          stop.stopTimesForPattern[1].stop.platformCode
        ) {
          text += `${intl.formatMessage({ id: 'platform' })},`;
          text += `${stop.stopTimesForPattern[1].stop.platformCode}`;
        }
      }
    }
    return text;
  };

  const getVehicleTripLink = () => {
    let vehicleTripLink;
    let vehicleState;
    /* If vehicle is null, draw a simple image to indicate the different vehicle.
    const vehicleIcon = !vehicle &&
      prevVehicleDeparture &&
      patternExists &&
      prevVehicleDeparture > stop.stopTimesForPattern[0].scheduledDeparture && (
        <span className="route-now-content">
          <IconWithTail
            className={cx(mode, 'tail-icon')}
            img={`icon-icon_${mode}-live`}
            rotate={180}
            vehicleNumber={patternId}
          />
        </span>
      );
     */
    if (vehicle) {
      const maxDistance = vehicle.mode === 'rail' ? 100 : 50;
      const { realtimeDeparture, realtimeArrival, serviceDay } = firstDeparture;
      const arrivalTimeToStop = (serviceDay + realtimeArrival) * 1000;
      const departureTimeFromStop = (serviceDay + realtimeDeparture) * 1000;
      const vehicleTime = vehicle.timestamp * 1000;
      const distanceToStop = estimateItineraryDistance(stop, {
        lat: vehicle.lat,
        lon: vehicle.long,
      });
      vehicleState = getVehicleState(
        distanceToStop,
        maxDistance,
        vehicleTime,
        arrivalTimeToStop,
        departureTimeFromStop,
        first,
        last,
      );
      vehicleTripLink = vehicle.tripId ? (
        <TripLink key={vehicle.id} vehicle={vehicle} shortName={shortName} />
      ) : (
        <FuzzyTripLink
          stopName={stop.name}
          nextStopName={nextStop ? nextStop.name : null}
          key={vehicle.id}
          vehicle={vehicle}
        />
      );
    }
    return (
      <div className={cx('route-stop-now', vehicleState)}>
        {vehicleTripLink}
      </div>
    );
  };
  return (
    <li className={cx('route-stop location-details_container ', className)}>
      {getVehicleTripLink()}
      <div className={cx('route-stop-now_circleline', mode)} aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="white"
            stroke={color || 'currentColor'}
            strokeWidth="4"
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
          aria-label={getText()}
        >
          <div className="route-stop-container">
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
                <div className="platform-number-container">
                  <div
                    key={`${stop.scheduledDeparture}-platform-number`}
                    className={`platform-code ${
                      !stop.platformCode ? 'empty' : ''
                    }`}
                  >
                    {stop.platformCode}
                  </div>
                </div>
              </div>
              {patternExists && (
                <div
                  key={firstDeparture.scheduledDeparture}
                  className="route-stop-time"
                >
                  {fromStopTime(firstDeparture, currentTime)}
                </div>
              )}
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
              {nextDeparture && displayNextDeparture && (
                <div
                  key={nextDeparture.scheduledDeparture}
                  className="route-stop-time"
                >
                  {fromStopTime(nextDeparture, currentTime, true, true)}
                </div>
              )}
            </div>
            {patternExists &&
              stop.stopTimesForPattern[0].pickupType === 'NONE' &&
              !last && (
                <div className="drop-off-container">
                  <Icon img="icon-icon_info" color={config.colors.primary} />
                  <FormattedMessage
                    id="route-destination-arrives"
                    defaultMessage="Drop-off only"
                  />
                </div>
              )}
          </div>
        </Link>
      </div>
    </li>
  );
};

RouteStop.propTypes = {
  color: PropTypes.string,
  vehicle: PropTypes.object,
  stop: PropTypes.object,
  nextStop: PropTypes.object,
  mode: PropTypes.string,
  className: PropTypes.string,
  currentTime: PropTypes.number.isRequired,
  first: PropTypes.bool,
  last: PropTypes.bool,
  displayNextDeparture: PropTypes.bool,
  shortName: PropTypes.string,
};

RouteStop.defaultProps = {
  displayNextDeparture: true,
};

RouteStop.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

export default RouteStop;
