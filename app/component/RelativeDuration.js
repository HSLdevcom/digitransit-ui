import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';

function RelativeDuration(props) {
  const duration = moment.duration(props.duration);
  if (duration.asHours() >= 1) {
    const hours = duration.hours() + duration.days() * 24;
    return (
      <FormattedMessage
        id="travel-time-with-hours"
        values={{
          h: hours,
          min: duration.minutes(),
        }}
      />
    );
  }
  return (
    <FormattedMessage
      id="travel-time"
      values={{
        min: duration.minutes(),
      }}
    />
  );
}

RelativeDuration.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};

RelativeDuration.propTypes = {
  duration: PropTypes.number.isRequired,
};

export default RelativeDuration;
