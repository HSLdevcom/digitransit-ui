import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import moment from 'moment';
import { intlShape } from 'react-intl';
import { v4 as uuid } from 'uuid';
import { Link } from 'found';
import LocalTime from './LocalTime';
import { getHeadsignFromRouteLongName } from '../util/legUtils';
import { alertSeverityCompare } from '../util/alertUtils';
import Icon from './Icon';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { getRouteMode } from '../util/modeUtils';

const getMostSevereAlert = (route, trip) => {
  const alerts = [...(route?.alerts || []), ...(trip?.alerts || [])];
  return alerts.sort(alertSeverityCompare)[0];
};

const DepartureRow = (
  { departure, departureTime, showPlatformCode, canceled, ...props },
  { config, intl },
) => {
  const { trip, trip: { route } = {} } = departure;
  const mode = getRouteMode(route);

  const timeDiffInMinutes = Math.floor(
    (departureTime - props.currentTime) / 60,
  );
  let icon;
  let iconColor;
  let backgroundShape;
  let sr;
  if (route?.alerts?.length > 0) {
    const alert = getMostSevereAlert(route, trip);
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
  let { shortName } = departure.trip.route;
  if (shortName?.length > 6 || !shortName?.length) {
    shortName = (
      <Icon
        className={mode.toLowerCase()}
        img={`icon-icon_${mode.toLowerCase()}`}
      />
    );
  }

  const renderWithLink = (node, first) => {
    return (
      <>
        <Link
          to={`/${PREFIX_ROUTES}/${departure.trip.pattern.route.gtfsId}/${PREFIX_STOPS}/${departure.trip.pattern.code}/${departure.trip.gtfsId}`}
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
              shortName,
              destination: headsign,
              time: moment(departureTime * 1000).format('HH:mm'),
            },
          )}
        />
        {node}
      </>
    );
  };

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
          long: shortName.length <= 6 && shortName.length >= 5,
        })}
        style={{ backgroundColor: `#${departure.trip.route.color}` }}
      >
        {renderWithLink(
          <>
            <div className="route-number">{shortName}</div>
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
              <LocalTime time={departureTime} />
            </span>
            <span className="sr-only">
              {intl.formatMessage(
                {
                  id: 'departure-time-sr',
                },
                {
                  when: shownTime,
                  time: moment(departureTime * 1000).format('HH:mm'),
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
            <>
              <div
                className={
                  !departure.stop?.platformCode
                    ? 'platform-code empty'
                    : 'platform-code'
                }
              >
                {departure.stop?.platformCode}
              </div>
            </>,
          )}
        </td>
      )}
    </tr>
  );
};
DepartureRow.propTypes = {
  departure: PropTypes.object.isRequired,
  departureTime: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  showPlatformCode: PropTypes.bool,
  canceled: PropTypes.bool,
  className: PropTypes.string,
};

DepartureRow.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};
export default DepartureRow;
