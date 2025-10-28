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
    entities {
      __typename
      ... on Stop {
        id
        name
        code
        gtfsId
        routes {
          id
          mode
          shortName
        }
      }
      ... on Route {
        id
        mode
        shortName
      }
      ... on StopOnRoute {
        route {
          id
          mode
          shortName
        }
      }
    }
  }
`;
