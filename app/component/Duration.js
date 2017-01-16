import React from 'react';
import cx from 'classnames';

import Icon from './Icon';
import { durationToString } from '../util/timeUtils';

function Duration(props) {
  const duration = durationToString(props.duration * 1000);

  return (
    <span className={cx(props.className)}>
      <Icon img="icon-icon_time" />
      <span className="duration">{duration}</span>
    </span>
  );
}

Duration.description = () =>
  "Displays itinerary's duration in minutes, and a time icon next to it." +
  'Takes duration in seconds as props';

Duration.propTypes = {
  duration: React.PropTypes.number.isRequired,
  className: React.PropTypes.string,
};

export default Duration;
