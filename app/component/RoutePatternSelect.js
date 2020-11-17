/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import { routerShape, RedirectException } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import {
  enrichPatterns,
  routePatternOptionText,
} from '@digitransit-util/digitransit-util';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import {
  routePatterns as exampleRoutePatterns,
  twoRoutePatterns as exampleTwoRoutePatterns,
} from './ExampleData';
import { isBrowser } from '../util/browser';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';
// DT-3317

const DATE_FORMAT = 'YYYYMMDD';

class RoutePatternSelect extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
    className: PropTypes.string.isRequired,
    route: PropTypes.object.isRequired,
    onSelectChange: PropTypes.func.isRequired,
    serviceDay: PropTypes.string.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    gtfsId: PropTypes.string.isRequired,
    useCurrentTime: PropTypes.bool, // DT-3182
    lang: PropTypes.string.isRequired, // DT-3347
  };

  static contextTypes = {
    router: routerShape.isRequired,
    config: PropTypes.object, // DT-3317
    getStore: PropTypes.func.isRequired, // DT-3347
  };

  state = {
    loading: true,
  };

  componentDidMount = () => {
    this.props.relay.refetch(
      {
        date: this.props.serviceDay,
      },
      null,
      () => this.setState({ loading: false }),
    );
  };

  getOptions = () => {
    const { gtfsId, params, route, useCurrentTime, lang } = this.props; // DT-3182: added useCurrentTime, DT-3347: added lang
    const { router } = this.context;
    const { patterns } = route;

    if (patterns.length === 0) {
      return null;
    }

    const futureTrips = enrichPatterns(
      patterns,
      useCurrentTime,
      this.context.config.itinerary.serviceTimeRange,
    );

    if (futureTrips.length === 0) {
      return null;
    }

    // DT-3182: added sortBy 'tripsForDate.length' (reverse() = descending)
    // DT-2531: added sortBy 'activeDates.length'
    const options = sortBy(
      sortBy(
        sortBy(sortBy(futureTrips, 'code').reverse(), 'activeDates.length'),
        'activeDates[0]',
      ).reverse(),
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
              {routePatternOptionText(lang, pattern, true)}
            </div>
          );
        }
        return (
          <option key={pattern.code} value={pattern.code}>
            {routePatternOptionText(lang, pattern, false)}
          </option>
        );
      });

    if (options.every(o => o.key !== params.patternId)) {
      if (isBrowser) {
        router.replace(
          `/${PREFIX_ROUTES}/${gtfsId}/${PREFIX_STOPS}/${options[0].key}`,
        );
      } else {
        throw new RedirectException(
          `/${PREFIX_ROUTES}/${gtfsId}/${PREFIX_STOPS}/${options[0].key}`,
        );
      }
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
              // mousedown works for detecting select box open atleast for firefox, chrome and edge
              onMouseDown={() => {
                addAnalyticsEvent({
                  category: 'Route',
                  action: 'OpenDirectionMenu',
                  name: null,
                });
              }}
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
              <Icon img="icon-icon_direction-c" />
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
    refetch: (variables, renderVariables, callback) => {
      callback();
    },
  },
  params: {
    routeId: 'HSL:1010',
    patternId: 'HSL:1010:0:01',
  },
  useCurrentTime: true,
};

RoutePatternSelect.description = () => (
  <div>
    <p>Display a dropdown to select the pattern for a route</p>
    <ComponentUsageExample>
      <RoutePatternSelect
        route={exampleRoutePatterns}
        onSelectChange={() => {}}
        gtfsId="HSL:1010"
        lang="en"
        {...defaultProps}
      />
    </ComponentUsageExample>
    <ComponentUsageExample>
      <RoutePatternSelect
        route={exampleTwoRoutePatterns}
        onSelectChange={() => {}}
        gtfsId="HSL:1010"
        lang="en"
        {...defaultProps}
      />
    </ComponentUsageExample>
  </div>
);

// DT-2531: added activeDates
const withStore = createRefetchContainer(
  connectToStores(RoutePatternSelect, ['PreferencesStore'], context => ({
    serviceDay: context
      .getStore('TimeStore')
      .getCurrentTime()
      .format(DATE_FORMAT),
    lang: context.getStore('PreferencesStore').getLanguage(), // DT-3347
  })),
  {
    route: graphql`
      fragment RoutePatternSelect_route on Route
      @argumentDefinitions(date: { type: "String" }) {
        patterns {
          code
          headsign
          stops {
            name
          }
          tripsForDate(serviceDate: $date) {
            id
            stoptimes: stoptimesForDate(serviceDate: $date) {
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
  graphql`
    query RoutePatternSelectQuery($routeId: String!, $date: String!) {
      route(id: $routeId) {
        ...RoutePatternSelect_route @arguments(date: $date)
      }
    }
  `,
);

export { withStore as default, RoutePatternSelect as Component };
