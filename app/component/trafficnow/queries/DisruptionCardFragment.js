import graphql from 'react-relay';

export default graphql`
  fragment DisruptionCardFragment_alert on Alert {
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
        routes {
          gtfsId
          id
          mode
          shortName
        }
      }
      ... on Route {
        gtfsId
        id
        mode
        shortName
      }
      ... on StopOnRoute {
        route {
          gtfsId
          id
          mode
          shortName
        }
      }
    }
  }
`;
