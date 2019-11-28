/* eslint-disable func-names */
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
const DATE_FORMAT2 = 'dd D.M.'; // DT-2531

class RoutePatternSelect extends Component {
  static propTypes = {
    params: PropTypes.object,
    className: PropTypes.string,
    route: PropTypes.object,
    onSelectChange: PropTypes.func.isRequired,
    serviceDay: PropTypes.string.isRequired,
    relay: PropTypes.object.isRequired,
    gtfsId: PropTypes.string.isRequired,
    useCurrentTime: PropTypes.bool, // DT-3182
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
    const { gtfsId, params, route, useCurrentTime } = this.props; // DT-3182: added useCurrentTime
    const { router } = this.context;
    const { patterns } = route;

    if (patterns.length === 0) {
      return null;
    }

    let futureTrips = patterns;

    if (useCurrentTime === true) {
      // DT-3182
      const wantedTime = new Date().getTime();
      futureTrips.forEach(function(o) {
        if (o.tripsForDate !== undefined) {
          o.tripsForDate.forEach(function(t) {
            if (t.stoptimes !== undefined) {
              t.stoptimes.filter(
                s => (s.serviceDay + s.scheduledDeparture) * 1000 >= wantedTime,
              );
            }
          });
        }
      });
    }

    // DT-2531: remove duplicates and sort by day ascending and removing past dates
    futureTrips.forEach(function(x) {
      if (x.activeDates !== undefined) {
        // eslint-disable-next-line no-param-reassign
        x.activeDates = sortBy(
          x.activeDates
            .map(({ day }) => ({ day }))
            .map(JSON.stringify)
            .reverse()
            .filter(function(e, i, a) {
              return a.indexOf(e, i + 1) === -1;
            })
            .reverse()
            .map(JSON.parse),
          'day',
        ).filter(z => Number(z.day) > Number(moment().format(DATE_FORMAT)));
      } else {
        // eslint-disable-next-line no-param-reassign
        x.activeDates = [];
      }
    });

    futureTrips = futureTrips.filter(
      f => f.tripsForDate.length > 0 || f.activeDates.length > 0,
    );

    // DT-2531: shows main routes (both directions)
    if (futureTrips.length === 0 && patterns.length > 0) {
      futureTrips = patterns.filter(p => p.code.endsWith(':01'));
    }

    if (futureTrips.length === 0) {
      return null;
    }

    // DT-3182: added sortBy 'tripsForDate.length' (reverse() = descending)
    // DT-2531: added sortBy 'activeDates.length'
    const options = sortBy(
      sortBy(sortBy(futureTrips, 'code').reverse(), 'activeDates.length'),
      'tripsForDate.length',
    )
      .reverse()
      .map(pattern => {
        // DT-2531 changed to correct variable (maybe confusing with variable 'patterns')
        if (futureTrips.length === 2) {
          return (
            <div
              key={pattern.code}
              value={pattern.code}
              className="route-option-togglable"
            >
              {pattern.stops[0].name} ➔ {pattern.headsign}
            </div>
          );
        }

        // DT-2531 show activeDate(s) on option texts, if no trips for today
        if (
          pattern.tripsForDate.length === 0 &&
          pattern.activeDates.length > 0
        ) {
          return (
            <option key={pattern.code} value={pattern.code}>
              {pattern.stops[0].name} ➔ {pattern.headsign} ({moment(
                pattern.activeDates[0].day[0],
                DATE_FORMAT,
              ).format(DATE_FORMAT2)}
              {pattern.activeDates.length > 1
                ? ', '.concat(
                    moment(pattern.activeDates[1].day[0], DATE_FORMAT).format(
                      DATE_FORMAT2,
                    ),
                  )
                : ''}
              {pattern.activeDates.length > 2 ? ', ...' : ''})
            </option>
          );
        }

        return (
          <option key={pattern.code} value={pattern.code}>
            {pattern.stops[0].name} ➔ {pattern.headsign}
          </option>
        );
      });

    if (options.every(o => o.key !== params.patternId)) {
      router.replace(`/${PREFIX_ROUTES}/${gtfsId}/pysakit/${options[0].key}`);
    } else if (options.length > 0 && this.state.loading === true) {
      this.setState({ loading: false });
    }
    return options;
  };

  render() {
    const options = this.getOptions();
    return this.state.loading === true ? (
      <div className={cx('route-pattern-select', this.props.className)} />
    ) : (
      <div className={cx('route-pattern-select', this.props.className)}>
        {options && (options.length > 2 || options.length === 1) ? (
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
              {options &&
                options.filter(
                  o => o.props.value === this.props.params.patternId,
                )[0]}
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

// DT-2531: added activeDates
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
          tripsForDate(serviceDate: $serviceDay) {
            id
            stoptimes: stoptimesForDate(serviceDate: $serviceDay) {
              scheduledArrival
              scheduledDeparture
              serviceDay
              stop {
                id
              }
            }
          }
          activeDates: trips {
            day: activeDates
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
