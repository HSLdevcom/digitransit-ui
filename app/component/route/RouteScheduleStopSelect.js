import React, { PropTypes } from 'react';
import Icon from '../icon/icon';

function RouteScheduleStopSelect(props) {
  const options = props.options.map((option) =>
    (<option key={option.displayName + option.value} value={option.value}>
      {option.displayName}
    </option>));

  return (
    <div className="route-schedule-stop-select">
      <Icon img="icon-icon_arrow-dropdown"/>
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

export default RouteScheduleStopSelect;