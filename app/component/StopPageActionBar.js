import React, { PropTypes } from 'react';
import PrintLink from './PrintLink';
import DateSelect from './DateSelect';

const DATE_FORMAT = 'YYYYMMDD';

const StopPageActionBar = ({ printUrl, breakpoint, startDate, selectedDate, onDateChange }) => (
  printUrl &&
    <div id="stop-page-action-bar">
      <DateSelect
        startDate={startDate}
        selectedDate={selectedDate}
        dateFormat={DATE_FORMAT}
        onDateChange={onDateChange}
      />
      <PrintLink className="action-bar" href={printUrl} />
    </div>
  );

StopPageActionBar.displayName = 'StopPageActionBar';


StopPageActionBar.propTypes = {
  printUrl: PropTypes.string,
  breakpoint: PropTypes.string,
};

export default StopPageActionBar;
