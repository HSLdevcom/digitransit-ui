import PropTypes from 'prop-types';
import React from 'react';
import DateSelect from './DateSelect';
import SecondaryButton from './SecondaryButton';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const DATE_FORMAT = 'YYYYMMDD';

const printStop = e => {
  e.stopPropagation();
  window.print();
};

const printStopPDF = (e, stopPDFURL) => {
  e.stopPropagation();

  window.open(stopPDFURL);
};

const StopPageActionBar = ({
  stopPDFURL,
  startDate,
  selectedDate,
  onDateChange,
}) => (
  <div id="stop-page-action-bar">
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
    <div className="print-button-container">
      {stopPDFURL && (
        <SecondaryButton
          ariaLabel="print-timetable"
          buttonName="print-timetable"
          buttonClickAction={e => {
            printStopPDF(e, stopPDFURL);
            addAnalyticsEvent({
              category: 'Stop',
              action: 'PrintWeeklyTimetable',
              name: null,
            });
          }}
          buttonIcon="icon-icon_print"
          smallSize
        />
      )}
      <SecondaryButton
        ariaLabel="print"
        buttonName="print"
        buttonClickAction={e => {
          printStop(e);
          addAnalyticsEvent({
            category: 'Stop',
            action: 'PrintTimetable',
            name: null,
          });
        }}
        buttonIcon="icon-icon_print"
        smallSize
      />
    </div>
  </div>
);

StopPageActionBar.displayName = 'StopPageActionBar';

StopPageActionBar.propTypes = {
  startDate: PropTypes.string,
  selectedDate: PropTypes.string,
  onDateChange: PropTypes.func,
  stopPDFURL: PropTypes.string,
};

export default StopPageActionBar;
