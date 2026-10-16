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
    @argumentDefinitions(
      cancelationStartDate: { type: "OffsetDateTime!" }
      cancelationEndDate: { type: "OffsetDateTime!" }
    ) {
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
      canceledTrips(
        runningTimeRanges: [
          { start: $cancelationStartDate, end: $cancelationEndDate }
        ]
      ) {
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
