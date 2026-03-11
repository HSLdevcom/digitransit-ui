import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import {
  createRefetchContainer,
  fetchQuery,
  graphql,
  ReactRelayContext,
} from 'react-relay';
import cx from 'classnames';
import sortBy from 'lodash/sortBy';
import { matchShape } from 'found';
import enrichPatterns from '@digitransit-util/digitransit-util-enrich-patterns';
import { FormattedMessage } from 'react-intl';
import { useTranslationsContext } from '../../util/useTranslationsContext';
import { useConfigContext } from '../../configurations/ConfigContext';
import { routeShape, relayShape } from '../../util/shapes';
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

function RoutePatternSelectContainer({
  match,
  route,
  onSelectChange,
  gtfsId,
  className,
  relayEnvironment,
}) {
  const config = useConfigContext();
  const intl = useTranslationsContext();

  const { params, router } = match;

  const [similarRoutes, setSimilarRoutes] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(
    !!config.showSimilarRoutesOnRouteDropDown,
  );

  const getOptions = () => {
    const { patterns } = route;

    if (patterns.length === 0) {
      return null;
    }

    const futureTrips = enrichPatterns(
      patterns,
      false,
      config.itinerary.serviceTimeRange,
    );

    if (futureTrips.length === 0) {
      return null;
    }

    return sortBy(
      sortBy(futureTrips, 'inFuture').reverse(),
      'countTripsForDate',
    ).reverse();
  };

  useEffect(() => {
    if (!config.showSimilarRoutesOnRouteDropDown) {
      return;
    }

    let searchSimilarTo = route.shortName;
    const c = route.shortName.length ? route.shortName[0] : '';
    if (c < '0' || c > '9') {
      setLoadingSimilar(false);
      return;
    }
    if (Number.isNaN(Number(route.shortName))) {
      searchSimilarTo = route.shortName.replace(/\D/g, '');
    }
    if (!searchSimilarTo) {
      setLoadingSimilar(false);
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

    fetchQuery(
      relayEnvironment,
      query,
      { name: searchSimilarTo },
      {
        force: true,
      },
    )
      .toPromise()
      .then(results => {
        setSimilarRoutes(filterSimilarRoutes(results.routes, route));
        setLoadingSimilar(false);
      });
  }, []);

  useEffect(() => {
    const options = getOptions();
    if (options && options.every(o => o.code !== params.patternId)) {
      router.replace(routePagePath(gtfsId, PREFIX_STOPS, options[0].code));
    }
  }, [params.patternId, gtfsId, route]);

  const options = getOptions();
  if (!options) {
    return null;
  }

  const currentPattern = options.find(o => o.code === params.patternId);

  let mainRoutes = options.slice(0, 2).filter(o => !o.inFuture);
  if (
    mainRoutes.every(o => o.directionId === 0) ||
    mainRoutes.every(o => o.directionId === 1)
  ) {
    mainRoutes = mainRoutes.slice(0, 1);
  }
  const specialRoutes = options
    .slice(mainRoutes.length)
    .filter(o => !o.inFuture);
  const futureRoutes = options.slice(mainRoutes.length).filter(o => o.inFuture);

  const noSpecialRoutes = !specialRoutes.length;
  const noFutureRoutes = !futureRoutes.length;
  const noSimilarRoutes = !similarRoutes.length;

  const renderButtonOnly =
    mainRoutes.length > 0 &&
    noSpecialRoutes &&
    noFutureRoutes &&
    noSimilarRoutes;

  const directionSwap = mainRoutes.length === 2;
  if (renderButtonOnly) {
    const otherPattern = mainRoutes.find(o => o.code !== params.patternId);
    return (
      <div className={cx('route-pattern-select', className)} aria-atomic="true">
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
            onClick={
              directionSwap
                ? () => onSelectChange(otherPattern.code)
                : undefined
            }
          >
            {patternTextWithIcon(currentPattern)}
            {directionSwap && (
              <Icon className="toggle-icon" img="icon_direction-c" />
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
    config.showSimilarRoutesOnRouteDropDown &&
    !loadingSimilar &&
    similarRoutes.length > 0
  ) {
    optionArray.push({
      options: similarRoutes,
      name: intl.formatMessage({
        id: 'route-page.similar-routes',
      }),
    });
  }

  return (
    <RoutePatternSelect
      currentPattern={currentPattern}
      optionArray={optionArray}
      onSelectChange={onSelectChange}
      className={className}
      router={router}
    />
  );
}

RoutePatternSelectContainer.propTypes = {
  match: matchShape.isRequired,
  className: PropTypes.string.isRequired,
  route: routeShape.isRequired,
  onSelectChange: PropTypes.func.isRequired,
  gtfsId: PropTypes.string.isRequired,
  relayEnvironment: relayShape.isRequired,
};

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
