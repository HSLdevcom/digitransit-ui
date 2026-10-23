import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useFragment } from 'react-relay';
import sortBy from 'lodash/sortBy';
import { useRouter } from 'found';
import { routePagePath, PREFIX_STOPS } from '../../../utils/shared/path';
import Error404 from '../404';
import {
  getOldSearchItems,
  saveOldSearchItems,
} from '../../data/SearchHistory';
import { routeShape } from '../../../utils/client/shapes';
import PatternRedirectorFragment from './queries/PatternRedirectorFragment';

const PatternRedirector = ({ route }) => {
  const { router, match } = useRouter();
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

  const { routeId, type } = match.params;
  const path = routePagePath(
    routeId,
    type || PREFIX_STOPS,
    pattern?.code || `${routeId}:0:01`,
  );

  useEffect(() => {
    router.replace(path);
  }, [router, path]);

  return null;
};

PatternRedirector.propTypes = {
  route: routeShape.isRequired,
};

const PatternRedirectorGuard = ({ route: routeRef = null }) => {
  const { match } = useRouter();
  const route = useFragment(PatternRedirectorFragment, routeRef);
  if (!route) {
    const oldSearchItems = getOldSearchItems();
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
      saveOldSearchItems(oldSearchItems.filter(s => s !== oldItem[0]));
      return <Error404 error={error} />;
    }
    return <Error404 />;
  }
  return <PatternRedirector route={route} />;
};

PatternRedirectorGuard.propTypes = {
  route: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

export default PatternRedirectorGuard;
