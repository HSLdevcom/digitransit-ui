import { graphql } from 'react-relay';

export const ScheduleRouteFragment = graphql`
  fragment ScheduleRouteFragment on Route
  @argumentDefinitions(
    date: { type: "String" }
    serviceDate: { type: "String" }
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
    ...RoutePatternSelectContainer_route @arguments(date: $date)
    agency {
      name
      phone
    }
    patterns {
      alerts(types: [ROUTE, STOPS_ON_PATTERN]) {
        id
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
      }
      headsign
      code
      stops {
        name
      }
      trips: tripsForDate(serviceDate: $serviceDate) {
        stoptimes: stoptimesForDate(serviceDate: $serviceDate) {
          stop {
            id
          }
          realtimeState
          scheduledArrival
          scheduledDeparture
          serviceDay
        }
      }
      activeDates: trips {
        serviceId
        day: activeDates
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
    }
  }
`;
