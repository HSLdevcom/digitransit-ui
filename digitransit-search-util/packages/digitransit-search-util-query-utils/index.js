/* eslint-disable no-param-reassign */
import take from 'lodash/take';
import flatten from 'lodash/flatten';
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
  query digitransitSearchUtilQueryUtilsSearchRoutesQuery(
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
  query digitransitSearchUtilQueryUtilsFavouriteStationsQuery(
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
  query digitransitSearchUtilQueryUtilsFavouriteStopsQuery($ids: [String!]!) {
    stops(ids: $ids) {
      gtfsId
      lat
      lon
      name
      code
    }
  }
`;

const favouriteRoutesQuery = graphql`
  query digitransitSearchUtilQueryUtilsFavouriteRoutesQuery($ids: [String!]!) {
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

/** Verifies that the data for favourites is coherent and current and fixes errors */
const verify = (stopStationMap, favourites) => {
  const result = favourites
    .map(favourite => {
      const fromQuery = stopStationMap[favourite.gtfsId];
      if (fromQuery) {
        favourite.lat = fromQuery.lat;
        favourite.lon = fromQuery.lon;

        return favourite;
      }
      return null;
    })
    .filter(r => r !== null);
  return result;
};
/**
 * Set you Relay environment
 * @param {*} environment Your Relay environment
 *
 */
export function setRelayEnvironment(environment) {
  relayEnvironment = environment;
}
/**
 * Returns Stop and station objects .
 * @param {*} favourites
 */
export const getStopAndStationsQuery = favourites => {
  if (!relayEnvironment) {
    return Promise.resolve([]);
  }
  const queries = [];
  const ids = favourites.map(item => item.gtfsId);
  queries.push(
    fetchQuery(relayEnvironment, favouriteStopsQuery, {
      ids,
    }),
  );
  queries.push(
    fetchQuery(relayEnvironment, favouriteStationsQuery, {
      ids,
    }),
  );
  return Promise.all(queries)
    .then(qres =>
      qres.map(stopOrStation => {
        return stopOrStation.stops
          ? stopOrStation.stops
          : stopOrStation.stations;
      }),
    )
    .then(flatten)
    .then(result => result.filter(res => res !== null))
    .then(stopsAndStations => {
      // eslint-disable-next-line func-names
      const stopStationMap = stopsAndStations.reduce(function(
        map,
        stopOrStation,
      ) {
        // eslint-disable-next-line no-param-reassign
        map[stopOrStation.gtfsId] = stopOrStation;
        return map;
      },
      {});
      return verify(stopStationMap, favourites).map(stop => {
        const favourite = {
          type: 'FavouriteStop',
          properties: {
            ...stop,
            label: stop.name,
            layer: isStop(stop) ? 'favouriteStop' : 'favouriteStation',
          },
          geometry: {
            coordinates: [stop.lon, stop.lat],
          },
        };
        return favourite;
      });
    });
};

/**
 * Returns Favourite Route objects depending on input
 * @param {String} input Search text, if empty no objects are returned
 * @param {*} favourites
 */
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
/**
 * Returns Route objects depending on input
 * @param {String} input Search text, if empty no objects are returned
 * @param {*} feedIds
 */
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
    .then(suggestions => take(suggestions, 100));
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
