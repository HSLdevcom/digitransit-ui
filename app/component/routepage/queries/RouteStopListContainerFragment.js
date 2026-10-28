import { graphql } from 'react-relay';

export default graphql`
  fragment RouteStopListContainerFragment_pattern on Pattern
  @refetchable(queryName: "RouteStopListContainerRefetchQuery")
  @argumentDefinitions(
    currentTime: { type: "Long", defaultValue: 0 }
    patternId: { type: "String", defaultValue: "0" }
    startOfDay: { type: "Long", defaultValue: 0 }
    showStopStatusMarkers: { type: "Boolean", defaultValue: false }
  ) {
    directionId
    route {
      mode
      color
      shortName
      type
      gtfsId
    }
    stops {
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
      stopTimesForPattern(id: $patternId, startTime: $currentTime) {
        realtime
        realtimeState
        realtimeArrival
        realtimeDeparture
        serviceDay
        scheduledDeparture
        pickupType
        stop {
          platformCode
        }
      }
      gtfsId
      lat
      lon
      name
      desc
      code
      platformCode
      zoneId
    }
  }
`;
