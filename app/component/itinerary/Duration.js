import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

function Duration({ duration }) {
  const dur = Math.max(duration, 0);
  const hours = Math.floor(dur / 3600000);
  const mins = Math.floor(dur / 60000 - hours * 60);
  if (hours >= 1) {
    return (
      <FormattedMessage
        id="travel-time-with-hours"
        values={{ h: hours, min: mins }}
      />
    );
  }
  return (
    <FormattedMessage
      id="travel-time"
      values={{ min: mins === 0 ? '<1' : mins }}
    />
  );
}

Duration.propTypes = { duration: PropTypes.number.isRequired };

export default Duration;
