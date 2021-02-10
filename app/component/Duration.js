import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { durationToString } from '../util/timeUtils';

function Duration(props) {
  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  };
  const duration = durationToString(props.duration * 1000);
  const startTime = new Intl.DateTimeFormat('en-US', timeOptions).format(
    new Date(props.startTime),
  );
  const endTime = new Intl.DateTimeFormat('en-US', timeOptions).format(
    new Date(props.endTime),
  );
  const futureText = props.futureText
    ? props.futureText.charAt(0).toUpperCase() + props.futureText.slice(1)
    : '';
  return (
    <span className={cx(props.className)}>
      <span className="sr-only">
        <FormattedMessage id="aria-itinerary-summary" values={{ duration }} />{' '}
      </span>
      <Icon img="icon-icon_clock" className="clock" />
      <span className="duration" aria-hidden>
        {duration}
        {props.futureText !== '' && props.multiRow && (
          <span data-text={futureText} />
        )}
        <span
          data-text={
            props.multiRow && props.futureText !== ''
              ? `${startTime} - ${endTime}`
              : `${futureText} ${startTime} - ${endTime}`
          }
        />
      </span>
    </span>
  );
}

Duration.description = () =>
  "Displays itinerary's duration in minutes, and a time icon next to it." +
  'Takes duration in seconds as props';

Duration.propTypes = {
  duration: PropTypes.number.isRequired,
  className: PropTypes.string,
  startTime: PropTypes.number.isRequired,
  endTime: PropTypes.number.isRequired,
  futureText: PropTypes.string,
  multiRow: PropTypes.bool,
};

Duration.defaultTypes = {
  futureText: '',
  multiRow: false,
};

export default Duration;
