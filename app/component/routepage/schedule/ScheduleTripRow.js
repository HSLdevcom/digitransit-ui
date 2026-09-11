/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@digitransit-component/digitransit-component-icon';

/**
 * Presents a single departure/arrival row with optional cancel styling.
 */
function ScheduleTripRow({ departureTime, arrivalTime, isCanceled = false }) {
  return (
    <div className="trip-column" role="listitem" tabIndex={0}>
      <div
        className={cx('trip-from', 'trip-label', {
          canceled: isCanceled,
        })}
      >
        {departureTime}
      </div>
      <div className="trip-separator">
        <Icon img="arrow" color="#888888" />
      </div>
      <div
        className={cx('trip-to', 'trip-label', {
          canceled: isCanceled,
        })}
      >
        {arrivalTime}
      </div>
    </div>
  );
}
ScheduleTripRow.propTypes = {
  departureTime: PropTypes.string.isRequired,
  arrivalTime: PropTypes.string.isRequired,
  isCanceled: PropTypes.bool,
};

ScheduleTripRow.displayName = 'ScheduleTripRow';

export default ScheduleTripRow;
