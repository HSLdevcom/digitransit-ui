import { graphql } from 'react-relay';

export default graphql`
  query AlertsQuery($feedIds: [String!]) {
    alerts(feeds: $feedIds) {
      __typename
      id
      alertHeaderText
      alertDescriptionText
      alertEffect
      alertSeverityLevel
      effectiveStartDate
      effectiveEndDate
      alertUrl
      entities {
        __typename
        ... on Stop {
          id
          name
          code
          gtfsId
          locationType
          vehicleMode
          platformCode
        }
        ... on Route {
          gtfsId
          id
          mode
          shortName
          type
        }
        ... on StopOnRoute {
          route {
            gtfsId
            id
            mode
            shortName
            type
          }
          stop {
            id
            name
            code
            gtfsId
            locationType
            vehicleMode
            platformCode
          }
        }
      }
    }
  }
`;
