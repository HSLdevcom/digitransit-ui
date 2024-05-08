/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import { v4 as uuid } from 'uuid';
import { Link } from 'found';
import { configShape, departureShape } from '../util/shapes';
import { getHeadsignFromRouteLongName } from '../util/legUtils';
import { timeStr } from '../util/timeUtils';
import {
  alertSeverityCompare,
  getAlertsForObject,
  isAlertValid,
} from '../util/alertUtils';
import Icon from './Icon';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { getRouteMode } from '../util/modeUtils';
import { getCapacity } from '../util/occupancyUtil';

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
    ...props
  },
  { config, intl },
) {
  const { trip, trip: { route } = {} } = departure;
  const mode = getRouteMode(route);
  const departureTimeMs = departureTime * 1000;
  const time = timeStr(departureTimeMs);
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
        ? 'icon-icon_caution-white-excl-stroke'
        : 'icon-icon_info';
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
  const nameOrIcon =
    shortName?.length > 6 || !shortName?.length ? (
      <Icon
        className={mode.toLowerCase()}
        img={`icon-icon_${mode.toLowerCase()}`}
      />
    ) : (
      shortName
    );

  const renderWithLink = (node, first) => {
    return (
      <>
        <Link
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
          tabIndex={first ? '0' : '-1'}
          aria-hidden={!first}
          aria-label={intl.formatMessage(
            {
              id: 'departure-page-sr',
            },
            {
              shortName: shortName?.toLowerCase(),
              destination: headsign,
              time,
            },
          )}
        />
        {node}
      </>
    );
  };

  const capacity = getCapacity(
    config,
    trip?.occupancy?.occupancyStatus,
    departureTimeMs,
  );

  return (
    <tr
      className={cx(
        'departure-row',
        mode,
        departure.bottomRow ? 'bottom' : '',
        props.className,
      )}
      key={uuid()}
    >
      <td
        className={cx('route-number-container', {
          long: shortName && shortName.length <= 6 && shortName.length >= 5,
        })}
        style={{ backgroundColor: `#${departure.trip.route.color}` }}
      >
        {renderWithLink(
          <>
            <div aria-hidden="true" className="route-number">
              {nameOrIcon}
            </div>
            <span className="sr-only">{shortName?.toLowerCase()}</span>
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
          </>,
          true,
        )}
      </td>
      <td className={cx('route-headsign', departure.bottomRow ? 'bottom' : '')}>
        {renderWithLink(
          <div className="headsign">
            {headsign} {departure.bottomRow && departure.bottomRow}
          </div>,
        )}
      </td>
      <td className="time-cell">
        {renderWithLink(
          <>
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
          </>,
        )}
      </td>
      {showPlatformCode && (
        <td className="platform-cell">
          {renderWithLink(
            <div
              className={
                !departure.stop?.platformCode
                  ? 'platform-code empty'
                  : 'platform-code'
              }
            >
              {departure.stop?.platformCode}
            </div>,
          )}
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
            onClick={() => onCapacityClick()}
          >
            <Icon
              width={1.5}
              height={1.5}
              img={`icon-icon_${capacity}`}
              color={config.colors.primary}
            />
          </span>
        </td>
      )}
    </tr>
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
};

DepartureRow.defaultProps = {
  showPlatformCode: false,
  canceled: false,
  className: '',
  onCapacityClick: undefined,
};

DepartureRow.contextTypes = {
  config: configShape.isRequired,
  intl: intlShape.isRequired,
};
