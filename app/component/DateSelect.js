import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

function DateSelect(props, context) {
  const dates = [];
  const date = moment(props.startDate, props.dateFormat);

  dates.push(
    <option
      value={date.format(props.dateFormat)}
      key={date.format(props.dateFormat)}
    >
      {context.intl.formatMessage({ id: 'today', defaultMessage: 'Today' })}
    </option>,
  );

  dates.push(
    <option
      value={date.add(1, 'd').format(props.dateFormat)}
      key={date.format(props.dateFormat)}
    >
      {context.intl.formatMessage({
        id: 'tomorrow',
        defaultMessage: 'Tomorrow',
      })}
    </option>,
  );

  for (let i = 0; i < 28; i++) {
    dates.push(
      <option
        value={date.add(1, 'd').format(props.dateFormat)}
        key={date.format(props.dateFormat)}
      >
        {date.format('dd D.M.')}
      </option>,
    );
  }

  return (
    <div className="route-schedule-date">
      <Icon img="icon-icon_time" />
      <select value={props.selectedDate} onChange={props.onDateChange}>
        {dates}
      </select>
    </div>
  );
}
DateSelect.propTypes = {
  startDate: PropTypes.string.isRequired,
  selectedDate: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
};
DateSelect.contextTypes = {
  intl: intlShape.isRequired, // eslint-disable-line react/no-typos
};
DateSelect.displayName = 'DateSelect';

DateSelect.description = () => (
  <div>
    <p>Display a date selection using react components</p>
    <ComponentUsageExample>
      <DateSelect
        startDate="19700101"
        selectedDate="19700101"
        dateFormat="YYYYMMDD"
        onDateChange={event => event.target.value}
      />
    </ComponentUsageExample>
  </div>
);

export default DateSelect;
