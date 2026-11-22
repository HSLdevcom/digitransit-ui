import { graphql } from 'react-relay';

const TripStopListContainerFragment = graphql`
  fragment TripStopListContainerFragment_trip on Trip
  @argumentDefinitions(
    startOfDay: { type: "Long!", defaultValue: 0 }
    showStopStatusMarkers: { type: "Boolean!", defaultValue: false }
  ) {
    route {
      mode
      type
      gtfsId
      color
      shortName
    }
    pattern {
      code
      directionId
    }
    stoptimesForDate {
      stop {
        gtfsId
        name
        desc
        code
        lat
        lon
        zoneId
        alerts {
          alertEffect
          alertSeverityLevel
          effectiveEndDate
          effectiveStartDate
        }
        firstDeparture: stoptimesWithoutPatterns(
          startTime: $startOfDay
          timeRange: 7776000 # 90 days in seconds
          numberOfDepartures: 1
          omitCanceled: true
        ) @include(if: $showStopStatusMarkers) {
          serviceDay
          realtimeDeparture
        }
      }
      realtimeArrival
      realtimeDeparture
      realtime
      scheduledDeparture
      serviceDay
      realtimeState
    }
    isReplacement
    gtfsId
  }
`;

export default TripStopListContainerFragment;
