import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

function DateSelect(props) {
  const dates = [];
  const date = moment(props.startDate, props.dateFormat);

  for (let i = 0; i < 32; i++) {
    dates.push(
      <option
        value={date.format(props.dateFormat)}
        key={date.format(props.dateFormat)}
      >
        {date.format('dd D.M.')}
      </option>,
    );
    date.add(1, 'd');
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
