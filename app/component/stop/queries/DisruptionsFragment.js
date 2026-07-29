import { graphql } from 'react-relay';

export const DisruptionsFragment = graphql`
  fragment DisruptionsFragment on Stop {
    gtfsId
    locationType
    routes {
      gtfsId
    }
    canceledCalls {
      tripOnServiceDate {
        serviceDate
        trip {
          tripHeadsign
          pattern {
            code
            stops {
              name
              gtfsId
            }
            headsign
          }
          route {
            gtfsId
            type
            color
            mode
            shortName
          }
        }
      }
      stopCall {
        stopLocation {
          ... on Stop {
            gtfsId
          }
        }
        schedule {
          time {
            ... on ArrivalDepartureTime {
              departure
            }
          }
        }
      }
    }
    stops {
      id
      gtfsId
      routes {
        gtfsId
      }
      alerts(types: [STOP, ROUTES]) {
        id
        alertDescriptionText
        alertHash
        alertEffect
        alertHeaderText
        alertSeverityLevel
        alertUrl
        effectiveEndDate
        effectiveStartDate
        entities {
          __typename
          ... on Route {
            color
            type
            mode
            shortName
            gtfsId
          }
          ... on Stop {
            gtfsId
            name
            locationType
            vehicleMode
          }
        }
      }
    }
    alerts(types: [STOP, ROUTES]) {
      id
      alertDescriptionText
      alertHash
      alertEffect
      alertHeaderText
      alertSeverityLevel
      alertUrl
      effectiveEndDate
      effectiveStartDate
      entities {
        __typename
        ... on Route {
          color
          type
          mode
          shortName
          gtfsId
        }
        ... on Stop {
          gtfsId
          name
          locationType
          vehicleMode
        }
      }
    }
  }
`;
