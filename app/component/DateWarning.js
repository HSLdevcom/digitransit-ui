import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

const DATE_PATTERN = 'dd D.M.';

const DateWarning = ({ date, refTime }) => {
  const now = moment(refTime);
  const start = moment(date);

  if (start.isSame(now, 'day')) {
    return null;
  }

  return (
    <span className="date-warning">
      <FormattedMessage id="leaves" defaultMessage="Leaves" />
      &nbsp;
      {start.format(DATE_PATTERN)}
    </span>
  );
};

DateWarning.description = 'Displays a warning if the date is not today.';

DateWarning.propTypes = {
  date: React.PropTypes.number.isRequired,
  refTime: React.PropTypes.number.isRequired,
};

DateWarning.displayName = 'DateWarning';
export default DateWarning;
