import React from 'react';
import moment from 'moment';
import { FormattedMessage, intlShape } from 'react-intl';

function RelativeDuration(props) {
  let durationText;
  const duration = moment.duration(props.duration);

  const hourShort = <FormattedMessage id="hour-short" defaultMessage="h" />;

  const minuteShort = <FormattedMessage id="minute-short" defaultMessage="min" />;

  if (duration.asHours() >= 1) {
    const hours = duration.hours() + (duration.days() * 24);
    durationText = `${hours} ${hourShort} ${duration.minutes()} ${minuteShort}`;
  } else {
    durationText = `${duration.minutes()} ${minuteShort}`;
  }

  return <span>{durationText}</span>;
}

RelativeDuration.contextTypes = {
  intl: intlShape.isRequired,
};

RelativeDuration.propTypes = {
  duration: React.PropTypes.number.isRequired,
};

export default RelativeDuration;
