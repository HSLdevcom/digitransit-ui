import connectToStores from 'fluxible-addons-react/connectToStores';
import { graphql, createPaginationContainer } from 'react-relay';
import StopsNearYouMap from './map/StopsNearYouMap';

import TimeStore from '../store/TimeStore';
import FavouriteStore from '../store/FavouriteStore';
import PreferencesStore from '../store/PreferencesStore';

const StopsNearYouMapWithStores = connectToStores(
  StopsNearYouMap,
  [TimeStore, PreferencesStore, FavouriteStore],
  ({ getStore }, { match }) => {
    const currentTime = getStore(TimeStore).getCurrentTime().unix();
    const language = getStore(PreferencesStore).getLanguage();
    const favouriteIds =
      match.params.mode === 'CITYBIKE'
        ? new Set(
            getStore('FavouriteStore')
              .getBikeRentalStations()
              .map(station => station.stationId),
          )
        : new Set(
            getStore('FavouriteStore')
              .getStopsAndStations()
              .map(stop => stop.gtfsId),
          );
    return {
      language,
      currentTime,
      favouriteIds,
    };
  },
);

const containerComponent = createPaginationContainer(
  StopsNearYouMapWithStores,
  {
    stopsNearYou: graphql`
      fragment StopsNearYouMapContainer_stopsNearYou on QueryType
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        omitNonPickups: { type: "Boolean!", defaultValue: false }
        lat: { type: "Float!" }
        lon: { type: "Float!", defaultValue: 0 }
        filterByPlaceTypes: { type: "[FilterPlaceType]", defaultValue: null }
        filterByModes: { type: "[Mode]", defaultValue: null }
        first: { type: "Int!", defaultValue: 5 }
        after: { type: "String" }
        maxResults: { type: "Int" }
        maxDistance: { type: "Int" }
      ) {
        nearest(
          lat: $lat
          lon: $lon
          filterByPlaceTypes: $filterByPlaceTypes
          filterByModes: $filterByModes
          first: $first
          after: $after
          maxResults: $maxResults
          maxDistance: $maxDistance
        ) @connection(key: "StopsNearYouMapContainer_nearest") {
          edges {
            node {
              distance
              place {
                __typename
                ... on BikeRentalStation {
                  name
                  lat
                  lon
                  stationId
                  networks
                }
                ... on Stop {
                  gtfsId
                  lat
                  lon
                  name
                  parentStation {
                    lat
                    lon
                    name
                    gtfsId
                  }
                  patterns {
                    route {
                      gtfsId
                      shortName
                      mode
                    }
                    code
                    directionId
                    patternGeometry {
                      points
                    }
                  }
                  stoptimesWithoutPatterns(
                    startTime: $startTime
                    omitNonPickups: $omitNonPickups
                  ) {
                    scheduledArrival
                  }
                }
              }
            }
          }
        }
      }
    `,
    prioritizedStopsNearYou: graphql`
      fragment StopsNearYouMapContainer_prioritizedStopsNearYou on Stop
      @relay(plural: true) {
        gtfsId
        lat
        lon
        name
        parentStation {
          lat
          lon
          name
          gtfsId
        }
        patterns {
          route {
            gtfsId
            shortName
            mode
          }
          code
          directionId
          patternGeometry {
            points
          }
        }
        stoptimesWithoutPatterns {
          scheduledArrival
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.stopsNearYou && props.stopsNearYou.nearest;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        first: totalCount,
      };
    },
    getVariables(_, pagevars, fragmentVariables) {
      return {
        ...fragmentVariables,
        first: pagevars.count,
        after: pagevars.cursor,
      };
    },
    query: graphql`
      query StopsNearYouMapContainerRefetchQuery(
        $lat: Float!
        $lon: Float!
        $filterByPlaceTypes: [FilterPlaceType]
        $filterByModes: [Mode]
        $first: Int!
        $after: String
        $maxResults: Int!
        $maxDistance: Int!
        $startTime: Long!
        $omitNonPickups: Boolean!
      ) {
        viewer {
          ...StopsNearYouMapContainer_stopsNearYou
          @arguments(
            startTime: $startTime
            omitNonPickups: $omitNonPickups
            lat: $lat
            lon: $lon
            filterByPlaceTypes: $filterByPlaceTypes
            filterByModes: $filterByModes
            first: $first
            after: $after
            maxResults: $maxResults
            maxDistance: $maxDistance
          )
        }
      }
    `,
  },
);

export default containerComponent;
