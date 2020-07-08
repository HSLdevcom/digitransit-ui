import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import LocalTime from './LocalTime';
import { intlShape, FormattedMessage } from 'react-intl';

const DepartureRow = ({ departure, departureTime, ...props }) => {
    const mode = departure.trip.route.mode.toLowerCase();
    const timeDiffInMinutes = Math.floor(
        (departureTime - props.currentTime) / 60,
    );
    let shownTime;
    if (
    timeDiffInMinutes < 0
    ) {
    shownTime = (
        <LocalTime forceUtc={props.useUTC} time={departureTime} />
    );
    } else if (timeDiffInMinutes === 0) {
    shownTime = <FormattedMessage id="arriving-soon" defaultMessage="Now" />;
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
      <div className={cx('departure-row', mode)}>
        <div className="route-number-container">
          <div className="route-number">
            {departure.trip.route.shortName}
          </div>
        </div>
        <div className="route-headsign">{departure.headsign}</div>
        <div className={cx('route-arrival', { realtime: departure.realtime })}>{shownTime}</div>
        <div className={cx('route-time', { realtime: departure.realtime })}>
          <LocalTime time={departureTime} />
        </div>
      </div>
    );
  };
  DepartureRow.propTypes = {
    departure: PropTypes.object.isRequired,
  };

  export default DepartureRow;