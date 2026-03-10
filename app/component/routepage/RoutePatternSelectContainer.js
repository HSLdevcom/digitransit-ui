import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  createRefetchContainer,
  fetchQuery,
  graphql,
  ReactRelayContext,
} from 'react-relay';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import { routerShape } from 'found';
import enrichPatterns from '@digitransit-util/digitransit-util-enrich-patterns';
import { FormattedMessage, intlShape } from 'react-intl';
import { routeShape, relayShape, configShape } from '../../util/shapes';
import Icon from '../Icon';
import { routePagePath, PREFIX_STOPS } from '../../util/path';
import RoutePatternSelect, { patternTextWithIcon } from './RoutePatternSelect';

function filterSimilarRoutes(routes, currentRoute) {
  const withoutCurrent = routes.filter(r => r.gtfsId !== currentRoute.gtfsId);

  let routeBasename = currentRoute.shortName;
  if (Number.isNaN(Number(routeBasename))) {
    routeBasename = routeBasename.replace(/\D/g, ''); // Delete all non-digits from the string
  }
  const onlyRelatedRoutes = withoutCurrent.filter(r =>
    Number.isNaN(Number(r.shortName.replace(routeBasename, '')[0])),
  );
  return sortBy(onlyRelatedRoutes, 'shortName');
}

class RoutePatternSelectContainer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      similarRoutes: [],
      loadingSimilar: true,
    };
    if (this.context.config.showSimilarRoutesOnRouteDropDown) {
      this.fetchSimilarRoutes(this.props.route);
    }
  }

  static propTypes = {
    params: PropTypes.shape({
      patternId: PropTypes.string.isRequired,
    }).isRequired,
    className: PropTypes.string.isRequired,
    route: routeShape.isRequired,
    onSelectChange: PropTypes.func.isRequired,
    gtfsId: PropTypes.string.isRequired,
    relayEnvironment: relayShape.isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
    config: configShape,
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  fetchSimilarRoutes = route => {
    let searchSimilarTo = route.shortName;
    const c = route.shortName.length ? route.shortName[0] : '';
    if (c < '0' || c > '9') {
      // must start with number
      return;
    }
    if (Number.isNaN(Number(route.shortName))) {
      searchSimilarTo = route.shortName.replace(/\D/g, ''); // Delete all non-digits from the string
    }
    if (!searchSimilarTo) {
      // Dont try to search similar routes for routes that are named with letters (eg. P train)
      return;
    }
    const query = graphql`
      query RoutePatternSelectContainer_similarRoutesQuery($name: String) {
        routes(name: $name) {
          gtfsId
          shortName
          longName
          mode
          color
        }
      }
    `;

    const params = { name: searchSimilarTo };
    fetchQuery(this.props.relayEnvironment, query, params, {
      force: true,
    })
      .toPromise()
      .then(results => {
        this.setState({
          similarRoutes: filterSimilarRoutes(results.routes, this.props.route),
          loadingSimilar: false,
        });
      });
  };

  getOptions = () => {
    const { gtfsId, params, route } = this.props;
    const { router } = this.context;
    const { patterns } = route;

    if (patterns.length === 0) {
      return null;
    }

    const futureTrips = enrichPatterns(
      patterns,
      false,
      this.context.config.itinerary.serviceTimeRange,
    );

    if (futureTrips.length === 0) {
      return null;
    }

    const options = sortBy(
      sortBy(futureTrips, 'inFuture').reverse(),
      'countTripsForDate',
    ).reverse();
    if (options.every(o => o.code !== params.patternId)) {
      router.replace(routePagePath(gtfsId, PREFIX_STOPS, options[0].code));
    }
    return options;
  };

  render() {
    const { intl } = this.context;
    const options = this.getOptions();
    const currentPattern = options.find(
      o => o.code === this.props.params.patternId,
    );

    const possibleMainRoutes = options.slice(0, 2).filter(o => !o.inFuture);
    let mainRoutes = options.slice(0, 2).filter(o => !o.inFuture);
    if (
      possibleMainRoutes.every(o => o.directionId === 0) ||
      possibleMainRoutes.every(o => o.directionId === 1)
    ) {
      mainRoutes = possibleMainRoutes.slice(0, 1);
    }
    const specialRoutes = options
      .slice(mainRoutes.length)
      .filter(o => !o.inFuture);
    const futureRoutes = options
      .slice(mainRoutes.length)
      .filter(o => o.inFuture);

    const noSpecialRoutes = !specialRoutes.length;
    const noFutureRoutes = !futureRoutes.length;

    // If similar-route loading is enabled, avoid treating "no similar routes" as true
    // until loading finishes. This prevents an initial button-only render that jumps
    // to a dropdown once similar routes load.
    const noSimilarRoutes = this.context.config.showSimilarRoutesOnRouteDropDown
      ? !this.state.similarRoutes?.length && !this.state.loadingSimilar
      : true;

    const renderButtonOnly =
      mainRoutes.length &&
      mainRoutes.length <= 2 &&
      noSpecialRoutes &&
      noFutureRoutes &&
      noSimilarRoutes;

    const directionSwap = mainRoutes.length === 2;
    if (renderButtonOnly) {
      const otherPattern = mainRoutes.find(
        o => o.code !== this.props.params.patternId,
      );
      return (
        <div
          className={cx('route-pattern-select', this.props.className)}
          aria-atomic="true"
        >
          <h3 className="route-pattern-select-title">
            <FormattedMessage
              id="route-page.choose-direction"
              defaultMessage="Choose direction"
            />
          </h3>
          <label htmlFor="route-pattern-toggle-button">
            {directionSwap && (
              <span className="sr-only">
                <FormattedMessage id="swap-order-button-label" />
              </span>
            )}
            <button
              id="route-pattern-toggle-button"
              className="route-pattern-toggle"
              type="button"
              onClick={() =>
                directionSwap
                  ? this.props.onSelectChange(otherPattern.code)
                  : null
              }
            >
              {patternTextWithIcon(currentPattern)}
              {directionSwap && (
                <Icon
                  className="toggle-icon"
                  img="icon_direction-c"
                  viewBox="0 0 19 17"
                />
              )}
            </button>
          </label>
        </div>
      );
    }

    const optionArray = [];
    if (mainRoutes.length > 0) {
      optionArray.push({ options: mainRoutes, name: '' });
    }
    if (specialRoutes.length > 0) {
      optionArray.push({
        options: specialRoutes,
        name: intl.formatMessage({
          id: 'route-page.special-routes',
        }),
      });
    }
    if (futureRoutes.length > 0) {
      optionArray.push({
        options: futureRoutes,
        name: intl.formatMessage({
          id: 'route-page.future-routes',
        }),
      });
    }

    if (
      this.context.config.showSimilarRoutesOnRouteDropDown &&
      !this.state.loadingSimilar &&
      this.state.similarRoutes?.length > 0
    ) {
      optionArray.push({
        options: this.state.similarRoutes,
        name: intl.formatMessage({
          id: 'route-page.similar-routes',
        }),
      });
    }

    return (
      <div className={cx('route-pattern-select', this.props.className)}>
        <h3 className="route-pattern-select-title">
          <FormattedMessage
            id="route-page.choose-direction"
            defaultMessage="Choose direction"
          />
        </h3>
        <RoutePatternSelect
          currentPattern={currentPattern}
          optionArray={optionArray}
          onSelectChange={this.props.onSelectChange}
          className={this.props.className}
        />
      </div>
    );
  }
}

const withStore = createRefetchContainer(
  props => (
    <ReactRelayContext.Consumer>
      {({ environment }) => (
        <RoutePatternSelectContainer
          {...props}
          relayEnvironment={environment}
        />
      )}
    </ReactRelayContext.Consumer>
  ),
  {
    route: graphql`
      fragment RoutePatternSelectContainer_route on Route
      @argumentDefinitions(date: { type: "String" }) {
        shortName
        mode
        gtfsId
        patterns {
          code
          directionId
          headsign
          stops {
            name
          }
          activeDates: trips {
            serviceId
            day: activeDates
          }
          tripsForDate: tripsForDate(serviceDate: $date) {
            stoptimes: stoptimesForDate(serviceDate: $date) {
              scheduledDeparture
              serviceDay
            }
          }
        }
      }
    `,
  },
  graphql`
    query RoutePatternSelectContainerQuery($routeId: String!, $date: String!) {
      route(id: $routeId) {
        ...RoutePatternSelectContainer_route @arguments(date: $date)
      }
    }
  `,
);

export { withStore as default, RoutePatternSelectContainer as Component };
