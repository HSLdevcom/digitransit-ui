import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';

function RelativeDuration(props) {
  const duration = moment.duration(props.duration);

  const hourShort = <FormattedMessage id="hour-short" defaultMessage="h" />;

  const minuteShort = (
    <FormattedMessage id="minute-short" defaultMessage="min" />
  );

  if (duration.asHours() >= 1) {
    const hours = duration.hours() + duration.days() * 24;
    return (
      <span>
        {hours} {hourShort} {duration.minutes()} {minuteShort}
      </span>
    );
  }
  return (
    <span>
      {duration.minutes()} {minuteShort}
    </span>
  );
}

RelativeDuration.contextTypes = {
  intl: intlShape.isRequired,
};

RelativeDuration.propTypes = {
  duration: PropTypes.number.isRequired,
};

export default RelativeDuration;
