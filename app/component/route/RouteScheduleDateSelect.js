import React, { PropTypes } from 'react';
import Icon from '../icon/icon';
import moment from 'moment';
import { intlShape } from 'react-intl';

function RouteScheduleTripRow(props, context) {
  const dates = [];
  const date = moment(props.startDate, props.dateFormat);

  dates.push(
    <option value={date.format(props.dateFormat)} key={date.format(props.dateFormat)} >
      {context.intl.formatMessage({ id: 'today', defaultMessage: 'Today' })}
    </option>
  );

  dates.push(
    <option value={date.add(1, 'd').format(props.dateFormat)} key={date.format(props.dateFormat)} >
      {context.intl.formatMessage({ id: 'tomorrow', defaultMessage: 'Tomorrow' })}
    </option>
  );

  for (let i = 0; i < 28; i++) {
    dates.push(
      <option value={date.add(1, 'd').format(props.dateFormat)} key={date.format(props.dateFormat)}>
        {date.format('dd D.M')}
      </option>
    );
  }

  return (
    <div className="route-schedule-date">
      <Icon img="icon-icon_time" />
      <select
        value={props.selectedDate}
        onChange={props.onDateChange}
      >
        {dates}
      </select>
    </div>);
}
RouteScheduleTripRow.propTypes = {
  startDate: PropTypes.string.isRequired,
  selectedDate: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  onDateChange: PropTypes.func.isRequired,
};
RouteScheduleTripRow.contextTypes = {
  intl: intlShape.isRequired,
};

export default RouteScheduleTripRow;
