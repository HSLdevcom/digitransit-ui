import { graphql } from 'react-relay';

export default {
  trip: graphql`
    fragment TripStopsContainerFragment_trip on Trip
    @argumentDefinitions(
      startOfDay: { type: "Long!", defaultValue: 0 }
      showStopStatusMarkers: { type: "Boolean!", defaultValue: false }
    ) {
      stoptimesForDate {
        scheduledDeparture
      }
      ...TripStopListContainerFragment_trip
        @arguments(
          startOfDay: $startOfDay
          showStopStatusMarkers: $showStopStatusMarkers
        )
    }
  `,
  pattern: graphql`
    fragment TripStopsContainerFragment_pattern on Pattern {
      id
    }
  `,
  route: graphql`
    fragment TripStopsContainerFragment_route on Route
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
        stops {
          id
          gtfsId
          code
          alerts {
            id
            alertDescriptionText
            alertHash
            alertHeaderText
            alertSeverityLevel
            alertUrl
            effectiveEndDate
            effectiveStartDate
          }
        }
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
