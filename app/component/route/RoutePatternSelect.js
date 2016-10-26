import React from 'react';
import Relay from 'react-relay';
import Icon from '../icon/Icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { routePatterns as exampleRoutePatterns } from '../documentation/ExampleData';

function RoutePatternSelect(props) {
  const options = props.route && props.route.patterns.map(pattern =>
    (<option key={pattern.code} value={pattern.code}>
      {pattern.stops[0].name} ➔ {pattern.headsign}
    </option>));

  return (
    <div className="route-pattern-select">
      <Icon img="icon-icon_arrow-dropdown" />
      <select onChange={props.onSelectChange} value={props.params && props.params.patternId}>
        {options}
      </select>
    </div>
  );
}

RoutePatternSelect.propTypes = {
  params: React.PropTypes.object,
  route: React.PropTypes.object,
  onSelectChange: React.PropTypes.func.isRequired,
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

export default Relay.createContainer(RoutePatternSelect, {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        patterns {
          code
          headsign
          stops {
            name
          }
        }
      }
    `,
  },
});
