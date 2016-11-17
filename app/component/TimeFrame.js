import React from 'react';
import moment from 'moment';
import cx from 'classnames';

const TimeFrame = props => (
  <span className={cx(props.className)}>
    {'// '}{moment(props.startTime).format('HH:mm')} - {moment(props.endTime).format('HH:mm')}
  </span>
);

TimeFrame.description = 'Displays the time frame of interval (example: // 15:55 - 16:15)';

TimeFrame.propTypes = {
  startTime: React.PropTypes.number.isRequired,
  endTime: React.PropTypes.number.isRequired,
  className: React.PropTypes.string,
};

TimeFrame.displayName = 'TimeFrame';
export default TimeFrame;
