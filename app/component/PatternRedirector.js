import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import sortBy from 'lodash/sortBy';
import { matchShape, routerShape, RedirectException } from 'found';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { isBrowser } from '../util/browser';
import Error404 from './404';
import { saveSearchItems } from '../action/SearchActions';
import { getOldSearchItems } from '../util/storeUtils';

const PatternRedirector = ({ router, match, route }, context) => {
  if (!route) {
    const oldSearchItems = getOldSearchItems(context);
    const oldItem = oldSearchItems.filter(
      s =>
        s.item.properties.layer.startsWith('route-') &&
        s.item.properties.link === match.location.pathname,
    );
    if (oldItem && oldItem.length !== 0) {
      const error = {
        id: 'no-route-found',
        values: {
          shortName: oldItem[0].item.properties.shortName,
          longName: oldItem[0].item.properties.longName,
        },
      };
      context.executeAction(
        saveSearchItems,
        oldSearchItems.filter(s => s !== oldItem[0]),
      );
      return <Error404 error={error} />;
    }
    return <Error404 />;
  }
  let sortedPatternsByCountOfTrips;
  const tripsExists = route.patterns ? 'trips' in route.patterns[0] : false;
  if (tripsExists) {
    sortedPatternsByCountOfTrips = sortBy(
      sortBy(route.patterns, 'code').reverse(),
      'trips.length',
    ).reverse();
  }
  let pattern;
  if (
    Array.isArray(sortedPatternsByCountOfTrips) &&
    sortedPatternsByCountOfTrips.length > 0
  ) {
    [pattern] = sortedPatternsByCountOfTrips;
  } else {
    pattern =
      Array.isArray(route.patterns) && route.patterns.length > 0
        ? route.patterns[0]
        : undefined;
  }

  const path = `/${PREFIX_ROUTES}/${match.params.routeId}/${
    match.params.type || PREFIX_STOPS
  }/${pattern ? pattern.code : `${match.params.routeId}:0:01`}`;
  if (isBrowser) {
    router.replace(path);
  } else {
    throw new RedirectException(path);
  }
  return null;
};

PatternRedirector.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
};

PatternRedirector.propTypes = {
  router: routerShape.isRequired,
  match: matchShape.isRequired,
  route: PropTypes.object,
};

const containerComponent = createFragmentContainer(PatternRedirector, {
  route: graphql`
    fragment PatternRedirector_route on Route
    @argumentDefinitions(date: { type: "String" }) {
      patterns {
        code
        trips: tripsForDate(serviceDate: $date) {
          gtfsId
        }
      }
    }
  `,
});

export default containerComponent;
