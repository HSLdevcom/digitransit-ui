import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import LocalTime from './LocalTime';
import { getHeadsignFromRouteLongName } from '../util/legUtils';

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
  return (
    <div role="cell" className="departure-row-container">
      <div
        className={cx(
          'departure-row',
          mode,
          departure.bottomRow ? 'bottom' : '',
          props.className,
        )}
      >
        <div
          className="route-number-container"
          style={{ backgroundColor: `#${departure.trip.route.color}` }}
        >
          <div className="route-number">{departure.trip.route.shortName}</div>
        </div>
        <div
          className={cx('route-headsign', departure.bottomRow ? 'bottom' : '')}
        >
          {headsign} {departure.bottomRow && departure.bottomRow}
        </div>
        {shownTime && (
          <div
            className={cx('route-arrival', {
              realtime: departure.realtime,
              canceled,
            })}
          >
            {shownTime}
          </div>
        )}
        <div
          className={cx('route-time', {
            realtime: departure.realtime,
            canceled,
          })}
        >
          <LocalTime time={departureTime} />
        </div>
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
