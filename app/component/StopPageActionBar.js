import PropTypes from 'prop-types';
import React from 'react';
import PrintLink from './PrintLink';
import DateSelect from './DateSelect';

const DATE_FORMAT = 'YYYYMMDD';

const StopPageActionBar = ({
  printUrl,
  startDate,
  selectedDate,
  onDateChange,
}) =>
  (printUrl &&
    <div id="stop-page-action-bar">
      <DateSelect
        startDate={startDate}
        selectedDate={selectedDate}
        dateFormat={DATE_FORMAT}
        onDateChange={onDateChange}
      />
      <PrintLink className="action-bar" href={printUrl} />
    </div>) ||
  null;

StopPageActionBar.displayName = 'StopPageActionBar';

StopPageActionBar.propTypes = {
  printUrl: PropTypes.string,
  startDate: PropTypes.string,
  selectedDate: PropTypes.string,
  dateFormat: PropTypes.string,
  onDateChange: PropTypes.func,
};

export default StopPageActionBar;
