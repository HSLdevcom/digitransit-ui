import React, { PropTypes } from 'react';
import Icon from '../icon/icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import {
  routeScheduleStopSelectOptions as exampleOptions,
} from '../documentation/ExampleData';

function RouteScheduleStopSelect(props) {
  const options = props.options.map((option) =>
    (<option key={option.displayName + option.value} value={option.value}>
      {option.displayName}
    </option>));

  return (
    <div className="route-schedule-stop-select">
      <Icon img="icon-icon_arrow-dropdown" />
      <select onChange={props.onSelectChange} value={props.selected}>
        {options}
      </select>
      <div className="caret"></div>
    </div>
  );
}

RouteScheduleStopSelect.propTypes = {
  selected: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
  onSelectChange: PropTypes.func.isRequired,
};

RouteScheduleStopSelect.description = (
  <div>
    <p>
      Display a route schedule stop select using react components
    </p>
    <ComponentUsageExample>
      <RouteScheduleStopSelect
        selected={1}
        options={exampleOptions}
        onSelectChange={(event) => event.target.value}
      />
    </ComponentUsageExample>
  </div>);

export default RouteScheduleStopSelect;
