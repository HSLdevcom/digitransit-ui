import React from 'react';
import Icon from '../icon/icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { routePatterns as exampleRoutePatterns } from '../documentation/ExampleData';

export default function RoutePatternSelect(props) {
  const options = props.pattern.route.patterns.map((pattern) =>
    (<option key={pattern.code} value={pattern.code}>
      {pattern.stops[0].name} ➔ {pattern.headsign}
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

RoutePatternSelect.description = (
  <div>
    <p>
      Display a dropdown to select the pattern for a route
    </p>
    <ComponentUsageExample>
      <RoutePatternSelect
        pattern={exampleRoutePatterns}
        onSelectChange={() => {}}
      />
    </ComponentUsageExample>
  </div>);
