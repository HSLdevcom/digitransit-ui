import PropTypes from 'prop-types';
import React from 'react';
import ScheduleDropdown from './ScheduleDropdown';
import StopHeaderDisplay from './StopHeaderDisplay';
import { stopShape } from '../../../util/shapes';

/**
 * Header component for route schedules with origin/destination selection.
 * Includes printable stop headers for the print view.
 */
function ScheduleHeader({
  stops,
  from,
  to,
  onFromSelectChange,
  onToSelectChange,
}) {
  const allOptions = stops.map((stop, index) => ({
    label: stop.name,
    value: index,
  }));

  const safeDestinationIndex = Math.min(to, allOptions.length - 1);
  const fromOptions = allOptions.slice(0, safeDestinationIndex);
  const toOptions = allOptions.slice(from + 1);
  const fromDisplayName = fromOptions.find(o => o.value === from)?.label || '';
  const toDisplayName = toOptions.find(o => o.value === to)?.label || '';

  return (
    <div className="route-schedule-header row">
      <StopHeaderDisplay
        fromDisplayName={fromDisplayName}
        toDisplayName={toDisplayName}
      />
      <div className="route-schedule-dropdowns">
        <ScheduleDropdown
          id="origin"
          labelId="origin"
          title={fromDisplayName}
          list={fromOptions}
          value={from}
          onSelectChange={onFromSelectChange}
        />
        <ScheduleDropdown
          id="destination"
          labelId="destination"
          title={toDisplayName}
          list={toOptions}
          value={to}
          onSelectChange={onToSelectChange}
          alignRight
        />
      </div>
    </div>
  );
}
ScheduleHeader.propTypes = {
  stops: PropTypes.arrayOf(stopShape).isRequired,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
  onFromSelectChange: PropTypes.func.isRequired,
  onToSelectChange: PropTypes.func.isRequired,
};

ScheduleHeader.displayName = 'ScheduleHeader';

export default ScheduleHeader;
