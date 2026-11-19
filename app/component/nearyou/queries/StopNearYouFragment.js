import { graphql } from 'react-relay';

export default graphql`
  fragment StopNearYouFragment_stop on Stop
  @refetchable(queryName: "StopNearYouFragmentRefetchQuery")
  @argumentDefinitions(
    startTime: { type: "Long", defaultValue: 0 }
    omitNonPickups: { type: "Boolean", defaultValue: false }
  ) {
    id
    name
    gtfsId
    code
    desc
    lat
    lon
    alerts {
      alertSeverityLevel
      alertDescriptionText
      alertHeaderText
      effectiveStartDate
      effectiveEndDate
      entities {
        __typename
      }
    }
    zoneId
    platformCode
    locationType
    vehicleMode
    stops {
      zoneId
    }
    stoptimesWithoutPatterns(startTime: $startTime, omitNonPickups: $omitNonPickups) {
      realtimeDeparture
      realtime
      realtimeState
      serviceDay
      headsign
      stop {
        platformCode
      }
      trip {
        gtfsId
        tripHeadsign
        occupancy {
          occupancyStatus
        }
        pattern {
          code
          route {
            gtfsId
          }
        }
        route {
          alerts {
            alertSeverityLevel
            effectiveStartDate
            effectiveEndDate
          }
          type
          shortName
          longName
          gtfsId
          mode
          color
          patterns {
            headsign
          }
        }
      }
    }
  }
`;
