import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import { routerShape } from 'react-router';
import connectToStores from 'fluxible-addons-react/connectToStores';
import moment from 'moment';

import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import {
  routePatterns as exampleRoutePatterns,
  twoRoutePatterns as exampleTwoRoutePatterns,
} from './ExampleData';
import { PREFIX_ROUTES } from '../util/path';

const DATE_FORMAT = 'YYYYMMDD';

class RoutePatternSelect extends Component {
  static propTypes = {
    params: PropTypes.object,
    className: PropTypes.string,
    route: PropTypes.object,
    onSelectChange: PropTypes.func.isRequired,
    serviceDay: PropTypes.string.isRequired,
    activeTab: PropTypes.string.isRequired,
    relay: PropTypes.object.isRequired,
    gtfsId: PropTypes.string.isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.props.relay.setVariables({ serviceDay: this.props.serviceDay });
    this.state = {
      loading: false,
    };
  }

  componentWillMount = () => {
    const options = this.getOptions();
    if (options === null) {
      this.setState({ loading: true });
    }
  };

  getOptions = () => {
    const options =
      this.props.route.patterns.find(
        o => o.tripsForDate && o.tripsForDate.length > 0,
      ) !== undefined ||
      (this.props.route.patterns.find(
        o => o.tripsForDate && o.tripsForDate.length > 0,
      ) === undefined &&
        this.props.activeTab === 'aikataulu')
        ? sortBy(this.props.route.patterns, 'code')
            .filter(
              o =>
                this.props.activeTab !== 'aikataulu'
                  ? o.tripsForDate && o.tripsForDate.length > 0
                  : o,
            )
            .map(pattern => {
              if (this.props.route.patterns.length > 2) {
                return (
                  <option key={pattern.code} value={pattern.code}>
                    {pattern.stops[0].name} ➔ {pattern.headsign}
                  </option>
                );
              }
              return (
                <div
                  key={pattern.code}
                  value={pattern.code}
                  className="route-option-togglable"
                >
                  {pattern.stops[0].name} ➔ {pattern.headsign}
                </div>
              );
            })
        : null;
    const patternDepartures =
      options && options.filter(o => o.key === this.props.params.patternId);
    if (patternDepartures && patternDepartures.length === 0) {
      this.context.router.replace(
        `/${PREFIX_ROUTES}/${this.props.gtfsId}/pysakit/${options[0].key}`,
      );
    } else if (options !== null && this.state.loading === true) {
      this.setState({ loading: false });
    }
    return options;
  };

  render() {
    const options = this.getOptions();
    return this.state.loading === true ? (
      <div className={cx('route-pattern-select', this.props.className)} />
    ) : (
      <div
        className={cx('route-pattern-select', this.props.className, {
          hidden:
            this.props.route.patterns.find(
              o => o.tripsForDate && o.tripsForDate.length > 0,
            ) === undefined && this.props.activeTab !== 'aikataulu',
        })}
      >
        {options.length > 2 || options.length === 1 ? (
          <React.Fragment>
            <Icon img="icon-icon_arrow-dropdown" />
            <select
              id="select-route-pattern"
              onChange={e => this.props.onSelectChange(e.target.value)}
              value={this.props.params && this.props.params.patternId}
            >
              {options}
            </select>
          </React.Fragment>
        ) : (
          <div className="route-patterns-toggle">
            <div
              className="route-option"
              role="button"
              tabIndex={0}
              onKeyPress={() =>
                this.props.onSelectChange(
                  options.find(
                    o => o.props.value !== this.props.params.patternId,
                  ).props.value,
                )
              }
              onClick={() =>
                this.props.onSelectChange(
                  options.find(
                    o => o.props.value !== this.props.params.patternId,
                  ).props.value,
                )
              }
            >
              {
                options.filter(
                  o => o.props.value === this.props.params.patternId,
                )[0]
              }
            </div>

            <button
              type="button"
              className="toggle-direction"
              onClick={() =>
                this.props.onSelectChange(
                  options.find(
                    o => o.props.value !== this.props.params.patternId,
                  ).props.value,
                )
              }
            >
              <Icon img="icon-icon_direction-b" />
            </button>
          </div>
        )}
      </div>
    );
  }
}

const defaultProps = {
  activeTab: 'pysakit',
  className: 'bp-large',
  serviceDay: '20190306',
  relay: {
    setVariables: () => {},
  },
  params: {
    routeId: 'HSL:1010',
    patternId: 'HSL:1010:0:01',
  },
};

RoutePatternSelect.description = () => (
  <div>
    <p>Display a dropdown to select the pattern for a route</p>
    <ComponentUsageExample>
      <RoutePatternSelect route={exampleRoutePatterns} {...defaultProps} />
    </ComponentUsageExample>
    <ComponentUsageExample>
      <RoutePatternSelect route={exampleTwoRoutePatterns} {...defaultProps} />
    </ComponentUsageExample>
  </div>
);

const withStore = connectToStores(
  Relay.createContainer(RoutePatternSelect, {
    initialVariables: {
      serviceDay: moment().format(DATE_FORMAT),
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

export { withStore as default, RoutePatternSelect as Component };
