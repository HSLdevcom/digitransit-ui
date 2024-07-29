import { graphql } from 'react-relay';

const nearestQuery = graphql`
  query NearestQuery(
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
      ) @connection(key: "StopsNearYouContainer_nearest") {
        edges {
          node {
            distance
            place {
              __typename
              ... on RentalVehicle {
                lat
                lon
                name
                network
                vehicleId
                rentalUris {
                  android
                  ios
                  web
                }
                rentalNetwork {
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default nearestQuery;
