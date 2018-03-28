import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { routePatterns as exampleRoutePatterns } from './ExampleData';

const DATE_FORMAT = 'YYYYMMDD';

class RoutePatternSelect extends Component {

  static propTypes = {
    params: PropTypes.object,
    route: PropTypes.object,
    className: PropTypes.string,
    onSelectChange: PropTypes.func.isRequired,
    patterns: PropTypes.object.isRequired,
    serviceDay: PropTypes.string.isRequired,
    relay: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.props.relay.setVariables({ serviceDay: this.props.serviceDay });
  }
  render() {
    const options =
      this.props.route &&
      this.props.route.patterns.map(pattern => (
        <option key={pattern.code} value={pattern.code}>
          {pattern.stops[0].name} ➔ {pattern.headsign}
        </option>
      ));
    console.log(this.props.route.patterns);
    console.log(this.props.route);
    console.log(this.options);
    console.log(this.props.serviceDay);
    return (
      <div className={cx('route-pattern-select', this.props.className)}>
        <Icon img="icon-icon_arrow-dropdown" />
        <select
          onChange={this.props.onSelectChange}
          value={this.props.params && this.props.params.patternId}
        >
          {options}
        </select>
      </div>
    );
  }
}

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

export default connectToStores(
  Relay.createContainer(RoutePatternSelect, {
    initialVariables: {
      serviceDay: '19700101',
    },
    fragments: {
      route: () => Relay.QL`
      fragment on Route {
        patterns {
          code
          headsign
          stops {
            name
          }
          tripsForDate(serviceDay: $serviceDay) {
            id
            stoptimes: stoptimesForDate(serviceDay: $serviceDay) {
              scheduledArrival
              scheduledDeparture
              serviceDay
              stop {
                id
              }
            }
          }
        }
      }
      `,
    },
  }),
  [],
  context => ({
    serviceDay: context
      .getStore('TimeStore')
      .getCurrentTime()
      .format(DATE_FORMAT),
  }),
);
