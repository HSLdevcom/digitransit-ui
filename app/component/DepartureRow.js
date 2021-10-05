import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { intlShape } from 'react-intl';
import { v4 as uuid } from 'uuid';
import { Link } from 'found';
import LocalTime from './LocalTime';
import { getHeadsignFromRouteLongName } from '../util/legUtils';
import Icon from './Icon';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

const DepartureRow = (
  { departure, departureTime, showPlatformCode, canceled, showLink, ...props },
  { config, intl },
) => {
  const mode = departure.trip.route.mode.toLowerCase();
  const timeDiffInMinutes = Math.floor(
    (departureTime - props.currentTime) / 60,
  );
  const headsign =
    departure.headsign ||
    departure.trip.tripHeadsign ||
    getHeadsignFromRouteLongName(departure.trip.route);
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
        className={departure.trip.route.mode.toLowerCase()}
        img={`icon-icon_${departure.trip.route.mode.toLowerCase()}`}
      />
    );
  }

  const row = () => {
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
          className="route-number-container"
          style={{ backgroundColor: `#${departure.trip.route.color}` }}
        >
          <div className="route-number">{shortName}</div>
        </td>
        <td
          className={cx('route-headsign', departure.bottomRow ? 'bottom' : '')}
        >
          {headsign} {departure.bottomRow && departure.bottomRow}
        </td>
        <td className="time-cell">
          {shownTime && (
            <span
              className={cx('route-arrival', {
                realtime: departure.realtime,
                canceled,
              })}
            >
              {shownTime}
            </span>
          )}
          <span
            className={cx('route-time', {
              realtime: departure.realtime,
              canceled,
            })}
          >
            <LocalTime time={departureTime} />
          </span>
        </td>
        <td className="platform-cell">
          {showPlatformCode && (
            <div
              className={
                !departure.stop.platformCode
                  ? 'platform-code empty'
                  : 'platform-code'
              }
            >
              {departure.stop.platformCode}
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <>
      {showLink && (
        <Link
          to={`/${PREFIX_ROUTES}/${departure.trip.pattern.route.gtfsId}/${PREFIX_STOPS}/${departure.trip.pattern.code}`}
          onClick={() => {
            addAnalyticsEvent({
              category: 'Stop',
              action: 'OpenRouteViewFromStop',
              name: 'RightNowTab',
            });
          }}
        >
          {row()}
        </Link>
      )}
      {!showLink && <>{row()}</>}
    </>
  );
};
DepartureRow.propTypes = {
  departure: PropTypes.object.isRequired,
  departureTime: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  showPlatformCode: PropTypes.bool,
  canceled: PropTypes.bool,
  className: PropTypes.string,
  showLink: PropTypes.bool,
};

DepartureRow.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};
export default DepartureRow;
