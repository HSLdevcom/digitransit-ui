import Relay from 'react-relay/classic';
import merge from 'lodash/merge';
import take from 'lodash/take';
import { isStop } from './suggestionUtils';
import {
  mapRoute,
  routeNameCompare,
  filterMatchingToInput,
} from './searchUtils';

function getRelayQuery(query) {
  return new Promise((resolve, reject) => {
    const callback = readyState => {
      if (readyState.error) {
        reject(readyState.error);
      } else if (readyState.done) {
        resolve(Relay.Store.readQuery(query));
      }
    };

    Relay.Store.primeCache({ query }, callback);
  });
}

const queryFavouriteRoutes = favourites => {
  return Relay.createQuery(
    Relay.QL`
    query favouriteRoutes($ids: [String!]!) {
      routes(ids: $ids ) {
        gtfsId
        agency { name }
        shortName
        mode
        longName
        patterns { code }
      }
    }`,
    { ids: favourites },
  );
};
const queryFavouriteStops = favourites => {
  return Relay.createQuery(
    Relay.QL`
        query favouriteStops($ids: [String!]!) {
          stops(ids: $ids ) {
            gtfsId
            lat
            lon
            name
            code
          }
        }`,
    { ids: favourites.map(item => item.gtfsId) },
  );
};
const queryFavouriteStations = favourites => {
  return Relay.createQuery(
    Relay.QL`
        query favouriteStations($ids: [String!]!) {
          stations(ids: $ids ) {
            gtfsId
            lat
            lon
            name
          }
        }`,
    { ids: favourites.map(item => item.gtfsId) },
  );
};

const queryRoutes = (config, input) => {
  return Relay.createQuery(
    Relay.QL`
        query routes($feeds: [String!]!, $name: String) {
          viewer {
            routes(feeds: $feeds, name: $name ) {
              gtfsId
              agency {name}
              shortName
              mode
              longName
              patterns { 
                code
              }
            }
          }
        }`,
    {
      feeds:
        Array.isArray(config.feedIds) && config.feedIds.length > 0
          ? config.feedIds
          : null,
      name: input,
    },
  );
};
export const tryGetRelayQuery = async (query, defaultValue) => {
  try {
    return getRelayQuery(query) || defaultValue;
  } catch {
    return defaultValue;
  }
};

export const getStopAndStations = favouriteStops => {
  const stopQuery = queryFavouriteStops(favouriteStops);
  const stationQuery = queryFavouriteStations(favouriteStops);

  return getRelayQuery(stopQuery).then(stops =>
    getRelayQuery(stationQuery).then(stations =>
      merge(stops, stations, favouriteStops).map(stop => ({
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

export function getFavouriteRoutes(favourites, input) {
  const query = getRelayQuery(queryFavouriteRoutes(favourites));
  return query
    .then(favouriteRoutes => favouriteRoutes.map(mapRoute))
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
export function getRoutes(config, input) {
  const routesQuery = getRelayQuery(queryRoutes(config, input));
  if (typeof input !== 'string' || input.trim().length === 0) {
    return Promise.resolve([]);
  }
  const number = input.match(/^\d+$/);
  if (number && number[0].length > 3) {
    return Promise.resolve([]);
  }
  return routesQuery
    .then(data =>
      data[0].routes
        .map(mapRoute)
        .filter(route => !!route)
        .sort((x, y) => routeNameCompare(x.properties, y.properties)),
    )
    .then(suggestions => take(suggestions, 10));
}
