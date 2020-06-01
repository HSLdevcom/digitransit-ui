import merge from 'lodash/merge';
import take from 'lodash/take';
import moment from 'moment';
import { fetchQuery, graphql } from 'react-relay';
import routeNameCompare from '@digitransit-search-util/digitransit-search-util-route-name-compare';
import {
  mapRoute,
  isStop,
} from '@digitransit-search-util/digitransit-search-util-helpers';
import filterMatchingToInput from '@digitransit-search-util/digitransit-search-util-filter-matching-to-input';

let relayEnvironment = null;

const searchRoutesQuery = graphql`
  query digitransitSearchUtilSearchQueryUtilsSearchRoutesQuery(
    $feeds: [String!]!
    $name: String
  ) {
    viewer {
      routes(feeds: $feeds, name: $name) {
        gtfsId
        agency {
          name
        }
        shortName
        mode
        longName
        patterns {
          code
        }
      }
    }
  }
`;

const favouriteStationsQuery = graphql`
  query digitransitSearchUtilSearchQueryUtilsFavouriteStationsQuery(
    $ids: [String!]!
  ) {
    stations(ids: $ids) {
      gtfsId
      lat
      lon
      name
    }
  }
`;

const favouriteStopsQuery = graphql`
  query digitransitSearchUtilSearchQueryUtilsFavouriteStopsQuery(
    $ids: [String!]!
  ) {
    stops(ids: $ids) {
      gtfsId
      lat
      lon
      name
      code
    }
  }
`;

const favouriteRoutesQuery = () => {
  return graphql`
    query digitransitSearchUtilSearchQueryUtilsFavouriteRoutesQuery(
      $ids: [String!]!
    ) {
      routes(ids: $ids) {
        gtfsId
        agency {
          name
        }
        shortName
        mode
        longName
        patterns {
          code
        }
      }
    }
  `;
};
export function setRelayEnvironment(environment) {
  relayEnvironment = environment;
}
export const getStopAndStationsQuery = favourites => {
  if (!relayEnvironment) {
    return Promise.resolve([]);
  }
  return fetchQuery(relayEnvironment, favouriteStopsQuery, {
    ids: favourites.map(item => item.gtfsId),
  }).then(dataStops =>
    fetchQuery(relayEnvironment, favouriteStationsQuery, {
      ids: favourites.map(item => item.gtfsId),
    }).then(dataStations =>
      merge(dataStops.stops, dataStations.stations, favourites).map(stop => ({
        type: 'FavouriteStop',
        properties: {
          ...stop,
          label: stop.name,
          layer: isStop(stop) ? 'favouriteStop' : 'favouriteStation',
        },
        geometry: {
          coordinates: [stop.lon, stop.lat],
        },
      })),
    ),
  );
};

export function getFavouriteRoutesQuery(favourites, input) {
  if (!relayEnvironment) {
    return Promise.resolve([]);
  }
  return fetchQuery(relayEnvironment, favouriteRoutesQuery, { ids: favourites })
    .then(data => data.routes.map(mapRoute))
    .then(routes => routes.filter(route => !!route))
    .then(routes =>
      routes.map(favourite => ({
        ...favourite,
        properties: { ...favourite.properties, layer: 'favouriteRoute' },
        type: 'FavouriteRoute',
      })),
    )
    .then(routes =>
      filterMatchingToInput(routes, input, [
        'properties.shortName',
        'properties.longName',
      ]),
    )
    .then(routes =>
      routes.sort((x, y) => routeNameCompare(x.properties, y.properties)),
    );
}

export function getRoutesQuery(input, feedIds) {
  if (!relayEnvironment) {
    return Promise.resolve([]);
  }
  if (typeof input !== 'string' || input.trim().length === 0) {
    return Promise.resolve([]);
  }
  const number = input.match(/^\d+$/);
  if (number && number[0].length > 3) {
    return Promise.resolve([]);
  }

  return fetchQuery(relayEnvironment, searchRoutesQuery, {
    feeds: Array.isArray(feedIds) && feedIds.length > 0 ? feedIds : null,
    name: input,
  })
    .then(data =>
      data.viewer.routes
        .map(mapRoute)
        .filter(route => !!route)
        .sort((x, y) => routeNameCompare(x.properties, y.properties)),
    )
    .then(suggestions => take(suggestions, 10));
}

export const withCurrentTime = location => {
  const query = (location && location.query) || {};
  return {
    ...location,
    query: {
      ...query,
      time: query.time ? query.time : moment().unix(),
    },
  };
};
