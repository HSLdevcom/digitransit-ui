import PropTypes from 'prop-types';
import React from 'react';
import Link from 'found/Link';
import { FormattedMessage, intlShape } from 'react-intl';
import cx from 'classnames';
import {
  alertShape,
  configShape,
  vehicleShape,
  stopTimeShape,
} from '../../util/shapes';
import AddressRow from '../AddressRow';
import TripLink from './TripLink';
import FuzzyTripLink from './FuzzyTripLink';
import ServiceAlertIcon from '../ServiceAlertIcon';
import { fromStopTime } from './DepartureTime';
import ZoneIcon from '../ZoneIcon';
import { getActiveAlertSeverityLevel } from '../../util/alertUtils';
import { PREFIX_STOPS } from '../../util/path';
import { addAnalyticsEvent } from '../../util/analyticsUtils';
import { getZoneLabel } from '../../util/legUtils';
import { estimateItineraryDistance } from '../../util/geo-utils';
import getVehicleState from '../../util/vehicleStateUtils';
import Icon from '../Icon';

function getDepartureTime(stoptime) {
  return (
    stoptime.serviceDay +
    (stoptime.realtimeState === 'CANCELED' || stoptime.realtimeDeparture === -1
      ? stoptime.scheduledDeparture
      : stoptime.realtimeDeparture)
  );
}

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
    prevStop,
    hideDepartures,
    loop,
    singleLoop,
  },
  { config, intl },
) => {
  let firstDeparture;
  let nextDeparture;

  if (stop.stopTimesForPattern?.length > 0) {
    const st1 = stop.stopTimesForPattern[0];
    const st2 = stop.stopTimesForPattern[1];
    let showDepartures = true;

    // special logic for cyclic routes: try to pick
    // departures at start stop and arrivals at end stop
    if (first && loop) {
      if (singleLoop) {
        // check if first stop is already behind
        // we do not want to show arrival time to it
        const nextStopTime = nextStop?.stopTimesForPattern[0];
        if (
          (st1 && !nextStopTime) ||
          getDepartureTime(st1) > getDepartureTime(nextStopTime)
        ) {
          showDepartures = false;
        } else {
          firstDeparture = st1;
          // do not set nextDeparture, it is arrival back to start
        }
      } else if (
        st1?.pickupType === 'NONE' &&
        st2 &&
        st2.pickupType !== 'NONE'
      ) {
        firstDeparture = st2;
      }
    }
    if (last && loop) {
      if (
        (singleLoop && st2) ||
        (st1?.pickupType !== 'NONE' && st2?.pickupType === 'NONE')
      ) {
        firstDeparture = st2;
      }
    }
    if (!firstDeparture && showDepartures) {
      // no special logic applied, use defaults
      firstDeparture = st1;
      nextDeparture = st2;
    }
  }

  const getDepartureText = stoptime => {
    let departureText = '';
    if (stoptime) {
      const departureTime = getDepartureTime(stoptime);
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

    if (firstDeparture) {
      text += `${intl.formatMessage({ id: 'leaves' })},`;
      text += `${getDepartureText(stop.stopTimesForPattern[0])},`;
      if (firstDeparture.realtime) {
        text += `${intl.formatMessage({ id: 'realtime' })},`;
      }
      if (stop.stopTimesForPattern[0].stop.platformCode) {
        text += `${intl.formatMessage({ id: 'platform' })},`;
        text += `${stop.stopTimesForPattern[0].stop.platformCode},`;
      }
      if (displayNextDeparture) {
        text += `${intl.formatMessage({ id: 'next' })},`;
        text += `${getDepartureText(
          stop.stopTimesForPattern[1],
          currentTime,
        )},`;
        if (nextDeparture?.realtime) {
          text += `${intl.formatMessage({ id: 'realtime' })},`;
        }
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
    if (vehicle && firstDeparture) {
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
      const vehicleWithParsedShortname = {
        ...vehicle,
        shortName:
          vehicle.shortName &&
          config.realTime[vehicle.route?.split(':')[0]].vehicleNumberParser(
            vehicle.shortName,
          ),
      };
      vehicleTripLink = vehicle.tripId ? (
        <TripLink
          key={vehicle.id}
          vehicle={vehicleWithParsedShortname}
          shortName={shortName}
          mode={mode}
        />
      ) : (
        <FuzzyTripLink
          stopName={vehicleState === 'arriving' ? prevStop?.name : stop?.name}
          nextStopName={
            vehicleState === 'arriving' ? stop?.name : nextStop?.name
          }
          mode={mode}
          key={vehicle.id}
          vehicle={vehicleWithParsedShortname}
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
          as="button"
          type="button"
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
              {firstDeparture && (
                <div
                  key={firstDeparture.scheduledDeparture}
                  className="route-stop-time"
                >
                  {!hideDepartures && fromStopTime(firstDeparture, currentTime)}
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
                  {!hideDepartures &&
                    fromStopTime(nextDeparture, currentTime, true, true)}
                </div>
              )}
            </div>
            {firstDeparture &&
              stop.stopTimesForPattern[0].pickupType === 'NONE' &&
              !last && (
                <div className="drop-off-container">
                  <Icon img="icon_info" color={config.colors.primary} />
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
  vehicle: vehicleShape,
  stop: PropTypes.shape({
    code: PropTypes.string,
    name: PropTypes.string,
    desc: PropTypes.string,
    gtfsId: PropTypes.string,
    zoneId: PropTypes.string,
    scheduledDeparture: PropTypes.number,
    platformCode: PropTypes.string,
    alerts: PropTypes.arrayOf(alertShape),
    stopTimesForPattern: PropTypes.arrayOf(stopTimeShape),
  }).isRequired,
  nextStop: PropTypes.shape({
    name: PropTypes.string,
    stopTimesForPattern: PropTypes.arrayOf(stopTimeShape),
  }),
  prevStop: PropTypes.shape({
    name: PropTypes.string,
  }),
  mode: PropTypes.string,
  className: PropTypes.string,
  currentTime: PropTypes.number.isRequired,
  first: PropTypes.bool,
  last: PropTypes.bool,
  displayNextDeparture: PropTypes.bool,
  shortName: PropTypes.string,
  hideDepartures: PropTypes.bool,
  loop: PropTypes.bool,
  singleLoop: PropTypes.bool,
};

RouteStop.defaultProps = {
  className: undefined,
  color: null,
  displayNextDeparture: true,
  first: false,
  last: false,
  mode: undefined,
  nextStop: null,
  prevStop: null,
  shortName: undefined,
  vehicle: undefined,
  hideDepartures: false,
  loop: false,
  singleLoop: false,
};

RouteStop.contextTypes = {
  intl: intlShape.isRequired,
  config: configShape.isRequired,
};

export default RouteStop;
