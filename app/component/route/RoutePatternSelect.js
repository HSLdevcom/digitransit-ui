import React from 'react';
import Icon from '../icon/icon';

export default function RoutePatternSelect(props) {
  const options = props.pattern.route.patterns.map((pattern) =>
    (<option key={pattern.code} value={pattern.code}>
      {pattern.stops[0].name} - {pattern.headsign}
    </option>));

  return (
    <div className="route-pattern-select">
      <Icon img="icon-icon_arrow-dropdown" />
      <select onChange={props.onSelectChange} value={props.pattern.code}>
        {options}
      </select>
    </div>
  );
}

RoutePatternSelect.propTypes = {
  pattern: React.PropTypes.object.isRequired,
  onSelectChange: React.PropTypes.func,
};
