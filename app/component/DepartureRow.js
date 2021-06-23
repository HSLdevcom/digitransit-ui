import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import LocalTime from './LocalTime';
import { getHeadsignFromRouteLongName } from '../util/legUtils';
import Icon from './Icon';

const DepartureRow = (
  { departure, departureTime, showPlatformCode, canceled, ...props },
  { config },
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
    shownTime = <FormattedMessage id="arriving-soon" defaultMessage="Now" />;
  } else if (timeDiffInMinutes > config.minutesToDepartureLimit) {
    shownTime = undefined;
  } else {
    shownTime = (
      <FormattedMessage
        id="departure-time-in-minutes"
        defaultMessage="{minutes} min"
        values={{ minutes: timeDiffInMinutes }}
      />
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
  return (
    <div className="departure-row-container">
      <div
        className={cx(
          'departure-row',
          mode,
          departure.bottomRow ? 'bottom' : '',
          props.className,
        )}
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
      </div>
    </div>
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
};
export default DepartureRow;
