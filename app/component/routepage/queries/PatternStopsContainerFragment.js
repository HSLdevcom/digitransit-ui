import { graphql } from 'react-relay';

export default {
  pattern: graphql`
    fragment PatternStopsContainerFragment_pattern on Pattern
    @argumentDefinitions(
      currentTime: { type: "Long!", defaultValue: 0 }
      patternId: { type: "String!", defaultValue: "0" }
      startOfDay: { type: "Long!", defaultValue: 0 }
      showStopStatusMarkers: { type: "Boolean!", defaultValue: false }
    ) {
      code
      ...RouteStopListContainerFragment_pattern
        @arguments(
          currentTime: $currentTime
          patternId: $patternId
          startOfDay: $startOfDay
          showStopStatusMarkers: $showStopStatusMarkers
        )
    }
  `,
  route: graphql`
    fragment PatternStopsContainerFragment_route on Route
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
        phone
        name
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
        trips: tripsForDate(serviceDate: $date) {
          stoptimes: stoptimesForDate(serviceDate: $date) {
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
  `,
};
