import React, { PropTypes } from 'react';
import Select from '../util/select';

function RouteScheduleHeader(props) {
  const options = props.stops.map((stop, index) => {
    const option = {
      displayName: stop.name,
      value: index,
    };
    return option;
  });
  const fromOptions = options.slice(0, props.to);
  const toOptions = options.slice(props.from + 1);

  return (
    <div className="route-schedule row padding-vertical-small">
      <div className="columns small-6 route-schedule-first">
        <Select
          onSelectChange={props.onFromSelectChange}
          selected={props.from}
          options={fromOptions}
        />
        <div className="route-schedule-select-caret"></div>
      </div>
      <div className="columns small-6 route-schedule-first">
        <Select
          onSelectChange={props.onToSelectChange}
          selected={props.to}
          options={toOptions}
        />
        <div className="route-schedule-select-caret"></div>
      </div>
    </div>);
}
RouteScheduleHeader.propTypes = {
  stops: PropTypes.array.isRequired,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
  onFromSelectChange: PropTypes.func.isRequired,
  onToSelectChange: PropTypes.func.isRequired,
};

export default RouteScheduleHeader;
