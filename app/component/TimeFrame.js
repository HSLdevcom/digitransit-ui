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
    return momentTime.format(TIME_PATTERN);
  }
  return momentTime.format(`${DATE_PATTERN} ${TIME_PATTERN}`);
};

const TimeFrame = ({ className, withSlashes, startTime, endTime }) => {
  const now = moment();
  const start = moment(startTime);
  const end = moment(endTime);

  return (
    <span className={className}>
      {withSlashes ? '//' : ''}<span className="capitalize">{dateTime(start, now)}</span> - <span className="capitalize">{dateTime(end, startTime)}</span>
    </span>
  );
};

TimeFrame.description = 'Displays the time frame of interval (example: // 15:55 - 16:15)';

TimeFrame.propTypes = {
  startTime: React.PropTypes.number.isRequired,
  endTime: React.PropTypes.number.isRequired,
  className: React.PropTypes.string,
  withSlashes: React.PropTypes.bool,
};

TimeFrame.defaultProps = {
  withSlashes: true,
};
TimeFrame.displayName = 'TimeFrame';
export { TimeFrame as default, dateOrEmpty };
