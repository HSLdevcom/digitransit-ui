import PropTypes from 'prop-types';
import React from 'react';
import DateSelect from './DateSelect';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const DATE_FORMAT = 'YYYYMMDD';

const StopPageActionBar = ({ startDate, selectedDate, onDateChange }) => (
  <DateSelect
    startDate={startDate}
    selectedDate={selectedDate}
    dateFormat={DATE_FORMAT}
    onDateChange={e => {
      onDateChange(e);
      addAnalyticsEvent({
        category: 'Stop',
        action: 'ChangeTimetableDay',
        name: null,
      });
    }}
  />
);

StopPageActionBar.displayName = 'StopPageActionBar';

StopPageActionBar.propTypes = {
  startDate: PropTypes.string,
  selectedDate: PropTypes.string,
  onDateChange: PropTypes.func,
};

export default StopPageActionBar;
