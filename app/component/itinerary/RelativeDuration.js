import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage, intlShape } from 'react-intl';

function RelativeDuration(props) {
  const hours = Math.floor(props.duration / 3600000);
  const mins = Math.floor(props.duration / 60000 - hours * 60);
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
      values={{ min: mins === 0 ? '< 1' : mins }}
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
