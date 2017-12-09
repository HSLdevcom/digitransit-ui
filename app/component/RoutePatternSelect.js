import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import cx from 'classnames';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { routePatterns as exampleRoutePatterns } from './ExampleData';

function RoutePatternSelect(props) {
  const options =
    props.route &&
    props.route.patterns.map(pattern => (
      <option key={pattern.code} value={pattern.code}>
        {pattern.stops[0].name} ➔ {pattern.headsign}
      </option>
    ));

  return (
    <div className={cx('route-pattern-select', props.className)}>
      <Icon img="icon-icon_arrow-dropdown" />
      <select
        onChange={props.onSelectChange}
        value={props.params && props.params.patternId}
      >
        {options}
      </select>
    </div>
  );
}

RoutePatternSelect.propTypes = {
  params: PropTypes.object,
  route: PropTypes.object,
  className: PropTypes.string,
  onSelectChange: PropTypes.func.isRequired,
};

RoutePatternSelect.description = () => (
  <div>
    <p>Display a dropdown to select the pattern for a route</p>
    <ComponentUsageExample>
      <RoutePatternSelect
        pattern={exampleRoutePatterns}
        onSelectChange={() => {}}
      />
    </ComponentUsageExample>
  </div>
);

export default createFragmentContainer(RoutePatternSelect, {
  route: graphql`
    fragment RoutePatternSelect_route on Route {
      patterns {
        code
        headsign
        stops {
          name
        }
      }
    }
  `,
});
