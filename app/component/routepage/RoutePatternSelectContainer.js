import PropTypes from 'prop-types';
import React, { useState, useEffect, useContext } from 'react';
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
import { routeShape } from '../../util/shapes';
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

// GraphQL query used to find routes with similar names
const similarRoutesQuery = graphql`
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

function getPatternOptions(patterns, serviceTimeRange) {
  if (patterns.length === 0) {
    return null;
  }
  const enriched = enrichPatterns(patterns, false, serviceTimeRange);
  if (enriched.length === 0) {
    return null;
  }
  // Sort: active-today patterns first, then by trip count descending
  return sortBy(
    sortBy(enriched, 'inFuture').reverse(),
    'countTripsForDate',
  ).reverse();
}

function RoutePatternSelectContainer({
  match,
  route,
  onSelectChange,
  gtfsId,
  className,
}) {
  const config = useConfigContext();
  const intl = useTranslationsContext();
  const { environment: relayEnvironment } = useContext(ReactRelayContext);

  const { params, router } = match;

  const [similarRoutes, setSimilarRoutes] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(
    !!config.showSimilarRoutesOnRouteDropDown,
  );

  // Fetch routes with similar names (numeric routes only)
  useEffect(() => {
    if (!config.showSimilarRoutesOnRouteDropDown) {
      return;
    }

    const firstChar = route.shortName[0] ?? '';
    const isNumericRoute = firstChar >= '0' && firstChar <= '9';
    if (!isNumericRoute) {
      setLoadingSimilar(false);
      return;
    }

    // For alphanumeric routes like "23A", search by the numeric base "23"
    const searchName = Number.isNaN(Number(route.shortName))
      ? route.shortName.replace(/\D/g, '')
      : route.shortName;
    if (!searchName) {
      setLoadingSimilar(false);
      return;
    }

    fetchQuery(
      relayEnvironment,
      similarRoutesQuery,
      { name: searchName },
      { force: true },
    )
      .toPromise()
      .then(results => {
        setSimilarRoutes(filterSimilarRoutes(results.routes, route));
        setLoadingSimilar(false);
      });
  }, []);

  const options = getPatternOptions(
    route.patterns,
    config.itinerary.serviceTimeRange,
  );

  // Redirect to first available pattern if the URL pattern is no longer valid
  useEffect(() => {
    if (options && options.every(o => o.code !== params.patternId)) {
      router.replace(routePagePath(gtfsId, PREFIX_STOPS, options[0].code));
    }
  }, [params.patternId, gtfsId, route]);

  if (!options) {
    return null;
  }

  const currentPattern = options.find(o => o.code === params.patternId);

  const nonFutureOptions = options.filter(o => !o.inFuture);
  const futureOptions = options.filter(o => o.inFuture);

  // Take up to 2 candidate main routes; collapse to 1 if both go the same direction
  let mainRoutes = nonFutureOptions.slice(0, 2);
  if (
    mainRoutes.length === 2 &&
    mainRoutes[0].directionId === mainRoutes[1].directionId
  ) {
    mainRoutes = [mainRoutes[0]];
  }
  const specialRoutes = nonFutureOptions.slice(mainRoutes.length);

  const renderButtonOnly =
    mainRoutes.length > 0 &&
    specialRoutes.length === 0 &&
    futureOptions.length === 0 &&
    similarRoutes.length === 0;

  const canSwapDirection = mainRoutes.length === 2;
  if (renderButtonOnly) {
    const otherPattern = canSwapDirection
      ? mainRoutes.find(o => o.code !== params.patternId)
      : undefined;
    return (
      <div className={cx('route-pattern-select', className)} aria-atomic="true">
        <label htmlFor="route-pattern-toggle-button">
          {canSwapDirection && (
            <span className="sr-only">
              <FormattedMessage id="swap-order-button-label" />
            </span>
          )}
          <button
            id="route-pattern-toggle-button"
            className="route-pattern-toggle"
            type="button"
            onClick={
              canSwapDirection
                ? () => onSelectChange(otherPattern.code)
                : undefined
            }
          >
            {patternTextWithIcon(currentPattern)}
            {canSwapDirection && (
              <Icon className="toggle-icon" img="icon_direction-c" />
            )}
          </button>
        </label>
      </div>
    );
  }

  const msg = id => intl.formatMessage({ id });
  const optionArray = [
    mainRoutes.length > 0 && { options: mainRoutes, name: '' },
    specialRoutes.length > 0 && {
      options: specialRoutes,
      name: msg('route-page.special-routes'),
    },
    futureOptions.length > 0 && {
      options: futureOptions,
      name: msg('route-page.future-routes'),
    },
    config.showSimilarRoutesOnRouteDropDown &&
      !loadingSimilar &&
      similarRoutes.length > 0 && {
        options: similarRoutes,
        name: msg('route-page.similar-routes'),
      },
  ].filter(Boolean);

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
};

const withStore = createRefetchContainer(
  RoutePatternSelectContainer,
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
