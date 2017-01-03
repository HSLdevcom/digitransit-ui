import React from 'react';
import moment from 'moment';


/**
 * Returns date or '' if same day as reference
 */
const dateOrEmpty = (momentTime, momentRefTime) => {
  if (momentTime.isSame(momentRefTime, 'day')) {
    return '';
  }
  return momentTime.format('dd D.M.');
};

/**
 * Returns date time or time if same day as reference
 */
const dateTime = (momentTime, momentRefTime) => {
  if (momentTime.isSame(momentRefTime, 'day')) {
    return momentTime.format('HH:mm');
  }
  return momentTime.format('D.M. HH:mm');
};

const TimeFrame = ({ className, withSlashes, startTime, endTime }) => {
  const now = moment();
  const start = moment(startTime);
  const end = moment(endTime);

  return (
    <span className={className}>
      {withSlashes ? '//' : ''}{dateTime(start, now)} - {dateTime(end, startTime)}
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
