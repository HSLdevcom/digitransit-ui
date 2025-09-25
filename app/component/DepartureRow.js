/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import cx from 'classnames';
import { Link } from 'found';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import {
  alertSeverityCompare,
  getAlertsForObject,
  isAlertValid,
} from '../util/alertUtils';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { getHeadsignFromRouteLongName } from '../util/legUtils';
import { getRouteMode } from '../util/modeUtils';
import { getCapacity } from '../util/occupancyUtil';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { configShape, departureShape } from '../util/shapes';
import { epochToTime } from '../util/timeUtils';
import Icon from './Icon';

const getMostSevereAlert = route => {
  const alerts = [...getAlertsForObject(route)];
  return alerts.sort(alertSeverityCompare)[0];
};

export default function DepartureRow(
  {
    departure,
    departureTime,
    showPlatformCode,
    canceled,
    onCapacityClick,
    isParentTabActive,
    ...props
  },
  { config, intl },
) {
  const { trip, trip: { route } = {} } = departure;
  const mode = getRouteMode(route, config);
  const departureTimeMs = departureTime * 1000;
  const time = epochToTime(departureTimeMs, config);
  const timeDiffInMinutes = Math.floor(
    (departureTime - props.currentTime) / 60,
  );
  let icon;
  let iconColor;
  let backgroundShape;
  let sr;
  if (
    route?.alerts?.filter(alert => isAlertValid(alert, props.currentTime))
      ?.length > 0
  ) {
    const alert = getMostSevereAlert(route);
    sr = (
      <span className="sr-only">
        {intl.formatMessage({
          id: 'disruptions-tab.sr-disruptions',
        })}
      </span>
    );
    icon =
      alert.alertSeverityLevel !== 'INFO'
        ? 'icon_caution-white-excl-stroke'
        : 'icon_info';
    iconColor = alert.alertSeverityLevel !== 'INFO' ? '#DC0451' : '#888';
    backgroundShape =
      alert.alertSeverityLevel !== 'INFO' ? undefined : 'circle';
  }
  const headsign =
    departure.headsign ||
    departure.trip.tripHeadsign ||
    getHeadsignFromRouteLongName(trip.route);
  let shownTime;
  if (timeDiffInMinutes <= 0) {
    shownTime = intl.formatMessage({
      id: 'arriving-soon',
      defaultMessage: 'Now',
    });
  } else if (timeDiffInMinutes > config.minutesToDepartureLimit) {
    shownTime = undefined;
  } else {
    shownTime = intl.formatMessage(
      {
        id: 'departure-time-in-minutes',
        defaultMessage: '{minutes} min',
      },
      { minutes: timeDiffInMinutes },
    );
  }
  const { shortName } = departure.trip.route;
  const lowerCaseShortName = shortName?.toLowerCase();
  const nameOrIcon =
    shortName?.length > 6 || !shortName?.length ? (
      <Icon className={mode} img={`icon_${mode}`} />
    ) : (
      shortName
    );

  const capacity = getCapacity(
    config,
    trip?.occupancy?.occupancyStatus,
    departureTimeMs,
  );

  const handleCapacityClick = e => {
    e.preventDefault();
    onCapacityClick();
  };

  const ariaLabel = `${intl.formatMessage(
    {
      id: 'departure-page-sr',
    },
    {
      shortName: lowerCaseShortName,
      destination: headsign,
      time,
    },
  )}${
    departure.stop?.platformCode
      ? intl.formatMessage(
          {
            id: 'platform-num',
          },
          {
            platformCode: departure.stop?.platformCode,
          },
        )
      : ''
  }`;

  return (
    <Link
      as="tr"
      tabIndex={isParentTabActive ? '0' : '-1'}
      to={`/${PREFIX_ROUTES}/${encodeURIComponent(
        departure.trip.pattern.route.gtfsId,
      )}/${PREFIX_STOPS}/${encodeURIComponent(
        departure.trip.pattern.code,
      )}/${encodeURIComponent(departure.trip.gtfsId)}`}
      onClick={() => {
        addAnalyticsEvent({
          category: 'Stop',
          action: 'OpenRouteViewFromStop',
          name: 'RightNowTab',
        });
      }}
      aria-label={ariaLabel}
      className={cx(
        'departure-row',
        'clickable',
        mode,
        departure.bottomRow ? 'bottom' : '',
        props.className,
      )}
      key={departure.trip.gtfsId}
    >
      <td
        className={cx('route-number-container', {
          long: shortName && shortName.length <= 6 && shortName.length >= 5,
        })}
        style={{ backgroundColor: `#${departure.trip.route.color}` }}
      >
        <div aria-hidden="true" className="route-number">
          {nameOrIcon}
        </div>
        {lowerCaseShortName && (
          <span className="sr-only">{lowerCaseShortName}</span>
        )}
        {icon && (
          <>
            <Icon
              className={backgroundShape}
              img={icon}
              color={iconColor}
              backgroundShape={backgroundShape}
            />
            {sr}
          </>
        )}
      </td>
      <td className={cx('route-headsign', departure.bottomRow ? 'bottom' : '')}>
        <div className="headsign">
          {headsign} {departure.bottomRow && departure.bottomRow}
        </div>
      </td>
      <td className="time-cell">
        {shownTime && (
          <span
            className={cx('route-arrival', {
              realtime: departure.realtime,
              canceled,
            })}
            aria-hidden="true"
          >
            {shownTime}
          </span>
        )}
        <span
          className={cx('route-time', {
            realtime: departure.realtime,
            canceled,
          })}
          aria-hidden="true"
        >
          {time}
        </span>
        <span className="sr-only">
          {intl.formatMessage(
            {
              id: 'departure-time-sr',
            },
            {
              when: shownTime,
              time,
              realTime: departure.realtime
                ? intl.formatMessage({ id: 'realtime' })
                : '',
            },
          )}
        </span>
      </td>
      {showPlatformCode && (
        <td className="platform-cell">
          <div
            className={
              !departure.stop?.platformCode
                ? 'platform-code empty'
                : 'platform-code'
            }
          >
            {departure.stop?.platformCode}
          </div>
        </td>
      )}
      {capacity && (
        // Use inline styles here for simplicity, some overrides make it impossible via the SASS-file
        <td
          className="capacity-cell"
          style={{ marginRight: '8px', color: config.colors.primary }}
        >
          <span
            className="capacity-icon-container"
            onClick={handleCapacityClick}
          >
            <Icon
              width={1.5}
              height={1.5}
              img={`icon_${capacity}`}
              color={config.colors.primary}
            />
          </span>
        </td>
      )}
    </Link>
  );
}

DepartureRow.propTypes = {
  departure: departureShape.isRequired,
  departureTime: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  showPlatformCode: PropTypes.bool,
  canceled: PropTypes.bool,
  className: PropTypes.string,
  onCapacityClick: PropTypes.func,
  isParentTabActive: PropTypes.bool,
};

DepartureRow.defaultProps = {
  showPlatformCode: false,
  canceled: false,
  className: '',
  onCapacityClick: undefined,
  isParentTabActive: false,
};

DepartureRow.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
