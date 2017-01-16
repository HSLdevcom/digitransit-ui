import React from 'react';
import moment from 'moment';

const TIME_PATTERN = 'HH:mm';
const DATE_PATTERN = 'dd D.M.';
/**
 * Returns date or '' if same day as reference
 */
const dateOrEmpty = (momentTime, momentRefTime) => {
  if (momentTime.isSame(momentRefTime, 'day')) {
    return '';
  }
  return momentTime.format(DATE_PATTERN);
};

/**
 * Returns date time or time if same day as reference
 */
const dateTime = (momentTime, momentRefTime) => {
  if (momentTime.isSame(momentRefTime, 'day')) {
    return <span className="capitalize">{momentTime.format(TIME_PATTERN)}</span>;
  }
  return (
    <span className="capitalize">
      <span className="timeframe-nextday">{momentTime.format(DATE_PATTERN)}</span>
      &nbsp;
      <span>{momentTime.format(TIME_PATTERN)}</span>
    </span>
  );
};

const TimeFrame = ({ className, startTime, endTime }) => {
  const now = moment();
  const start = moment(startTime);
  const end = moment(endTime);

  return (
    <span className={className}>
      {dateTime(start, now)} - {dateTime(end, startTime)}
    </span>
  );
};

TimeFrame.description = 'Displays the time frame of interval (example: 15:55 - 16:15)';

TimeFrame.propTypes = {
  startTime: React.PropTypes.number.isRequired,
  endTime: React.PropTypes.number.isRequired,
  className: React.PropTypes.string,
};

TimeFrame.displayName = 'TimeFrame';
export { TimeFrame as default, dateOrEmpty };
