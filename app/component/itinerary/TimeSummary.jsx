import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from '../Icon';
import { durationToString, timeStr } from '../../../utils/client/timeUtils';

export default function TimeSummary({
  duration,
  className = '',
  startTime,
  endTime,
  futureText = '',
  multiRow = false,
}) {
  const intl = useIntl();
  const durationStr = durationToString(intl, duration * 1000);
  const startTimeStr = timeStr(startTime);
  const endTimeStr = timeStr(endTime);
  const futureTextStr = futureText
    ? futureText.charAt(0).toUpperCase() + futureText.slice(1)
    : '';

  const departureTime = futureTextStr
    ? `${futureTextStr}, ${startTimeStr}`
    : startTimeStr;
  return (
    <span className={cx(className)}>
      <span className="sr-only">
        <FormattedMessage
          id="aria-itinerary-summary"
          values={{
            duration: durationStr,
            inFuture: futureTextStr,
            departureTime,
            arrivalTime: endTimeStr,
          }}
        />{' '}
      </span>
      <Icon img="icon_clock" className="clock" />
      <span className="duration" aria-hidden>
        {durationStr}
        {futureText !== '' && multiRow && <span data-text={futureTextStr} />}
        <span
          data-text={
            multiRow && futureText !== ''
              ? `${startTimeStr} - ${endTimeStr}`
              : `${futureTextStr} ${startTimeStr} - ${endTimeStr}`
          }
        />
      </span>
    </span>
  );
}

TimeSummary.propTypes = {
  duration: PropTypes.number.isRequired,
  className: PropTypes.string,
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  futureText: PropTypes.string,
  multiRow: PropTypes.bool,
};
