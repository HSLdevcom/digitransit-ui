import { graphql } from 'react-relay';

export const RouteAlertsContainerFragment = {
  route: graphql`
    fragment RouteAlertsContainerFragment_route on Route {
      color
      mode
      type
      shortName
      gtfsId
    }
  `,
  pattern: graphql`
    fragment RouteAlertsContainerFragment_pattern on Pattern
    @argumentDefinitions(date: { type: "LocalDate" }) {
      stops {
        name
      }
      code
      headsign
      alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
        id
        alertDescriptionText
        alertHash
        alertHeaderText
        alertEffect
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
            name
            code
            locationType
            vehicleMode
            gtfsId
          }
        }
      }
      canceledTrips(serviceDateRanges: [{ start: $date, end: null }]) {
        serviceDate
        trip {
          tripHeadsign
          stoptimes {
            headsign
            realtimeState
            scheduledArrival
            scheduledDeparture
            serviceDay
            stop {
              name
            }
          }
        }
      }
    }
  `,
};
