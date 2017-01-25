import React from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';

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

DateWarning.description = () => {
  const today = moment().hour(12).minute(34).second(0)
    .valueOf();
  const date = 1478611781000;
  return (
    <div>
      <p>
        Displays a warning if the date is not today.
      </p>
      <ComponentUsageExample description="today-show-nothing">
        <DateWarning
          date={today}
          refTime={today + 1000}
        />
      </ComponentUsageExample>
      <ComponentUsageExample description="tomorrow-show-warning">
        <DateWarning
          date={date}
          refTime={today}
        />
      </ComponentUsageExample>
    </div>
  );
};


DateWarning.propTypes = {
  date: React.PropTypes.number.isRequired,
  refTime: React.PropTypes.number.isRequired,
};

DateWarning.displayName = 'DateWarning';
export default DateWarning;
