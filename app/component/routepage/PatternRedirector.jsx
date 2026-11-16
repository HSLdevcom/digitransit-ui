import { useEffect } from 'react';
import { useFragment } from 'react-relay';
import sortBy from 'lodash/sortBy';
import { useRouter } from 'found';
import { routePagePath, PREFIX_STOPS } from '../../../utils/shared/path';
import Error404 from '../404';
import { getOldSearches, removeSearch } from '../../data/SearchHistory';
import { fragmentRefShape, routeShape } from '../../../utils/client/shapes';
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

export default function PatternRedirectorGuard({ route: routeRef = null }) {
  const { match } = useRouter();
  const route = useFragment(PatternRedirectorFragment, routeRef);
  if (!route) {
    const oldItem = getOldSearches().find(
      s =>
        s.properties.layer.startsWith('route-') &&
        s.properties.link === match.location.pathname,
    );
    if (oldItem) {
      const error = {
        id: 'no-route-found',
        values: {
          shortName: oldItem.properties.shortName,
          longName: oldItem.properties.longName,
        },
      };
      removeSearch({ item: oldItem });
      return <Error404 error={error} />;
    }
    return <Error404 />;
  }
  return <PatternRedirector route={route} />;
}

PatternRedirectorGuard.propTypes = {
  route: fragmentRefShape,
};
