import { graphql } from 'react-relay';

export const RoutePageFragment = graphql`
  fragment RoutePageFragment_route on Route
  @argumentDefinitions(
    date: { type: "String" }
    cancelationStartDate: { type: "OffsetDateTime!" }
    cancelationEndDate: { type: "OffsetDateTime!" }
  ) {
    gtfsId
    color
    shortName
    longName
    mode
    type
    ...RouteAgencyInfo_route
    ...RoutePatternSelectContainerFragment_route @arguments(date: $date)
    agency {
      name
      phone
      gtfsId
    }
    patterns {
      alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
        id
        alertDescriptionText
        alertHash
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
            name
            code
            vehicleMode
            gtfsId
          }
        }
      }
      headsign
      code
      stops {
        name
      }
      trips: tripsForDate(serviceDate: $date) {
        stoptimes: stoptimesForDate(serviceDate: $date) {
          realtimeState
          scheduledArrival
          scheduledDeparture
          serviceDay
        }
      }
      canceledTrips(
        runningTimeRanges: [
          { start: $cancelationStartDate, end: $cancelationEndDate }
        ]
      ) {
        serviceDate
        trip {
          pattern {
            code
          }
          gtfsId
        }
      }
      activeDates: trips {
        serviceId
        day: activeDates
      }
    }
  }
`;
