import { graphql, createPaginationContainer } from 'react-relay';
import NearYouMap from '../map/NearYouMap';

const containerComponent = createPaginationContainer(
  NearYouMap,
  {
    stops: graphql`
      fragment NearYouMapContainer_stops on QueryType
      @argumentDefinitions(
        lat: { type: "Float!" }
        lon: { type: "Float!", defaultValue: 0 }
        filterByPlaceTypes: { type: "[FilterPlaceType]", defaultValue: null }
        filterByModes: { type: "[Mode]", defaultValue: null }
        first: { type: "Int!", defaultValue: 5 }
        after: { type: "String" }
        maxResults: { type: "Int" }
        maxDistance: { type: "Int" }
        filterByNetwork: { type: "[String!]", defaultValue: null }
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
          filterByNetwork: $filterByNetwork
        ) @connection(key: "NearYouMapContainer_nearest") {
          edges {
            node {
              distance
              place {
                __typename
                ... on VehicleRentalStation {
                  lat
                  lon
                  stationId
                }
                ... on VehicleParking {
                  lat
                  lon
                  vehicleParkingId
                }
                ... on Stop {
                  gtfsId
                  lat
                  lon
                  patterns {
                    route {
                      gtfsId
                      shortName
                      mode
                      type
                    }
                    code
                    patternGeometry {
                      points
                    }
                  }
                  stops {
                    patterns {
                      route {
                        gtfsId
                        shortName
                        mode
                        type
                      }
                      code
                      patternGeometry {
                        points
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    prioritizedStops: graphql`
      fragment NearYouMapContainer_prioritizedStops on Stop
      @relay(plural: true) {
        gtfsId
        lat
        lon
        stops {
          patterns {
            route {
              gtfsId
              shortName
              mode
              type
            }
            code
            patternGeometry {
              points
            }
          }
        }
        patterns {
          route {
            gtfsId
            shortName
            mode
            type
          }
          code
          patternGeometry {
            points
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.stops?.nearest;
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
      query NearYouMapContainerRefetchQuery(
        $lat: Float!
        $lon: Float!
        $filterByPlaceTypes: [FilterPlaceType]
        $filterByModes: [Mode]
        $first: Int!
        $after: String
        $maxResults: Int!
        $maxDistance: Int!
        $filterByNetwork: [String!]
      ) {
        viewer {
          ...NearYouMapContainer_stops
            @arguments(
              lat: $lat
              lon: $lon
              filterByPlaceTypes: $filterByPlaceTypes
              filterByModes: $filterByModes
              first: $first
              after: $after
              maxResults: $maxResults
              maxDistance: $maxDistance
              filterByNetwork: $filterByNetwork
            )
        }
      }
    `,
  },
);

export default containerComponent;
