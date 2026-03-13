import { graphql } from 'react-relay';

export const DisruptionsFragment = graphql`
  fragment DisruptionsFragment on Stop
  @argumentDefinitions(
    startTime: { type: "Long" }
    timeRange: { type: "Int", defaultValue: 3600 }
  ) {
    gtfsId
    locationType
    routes {
      gtfsId
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
          }
        }
      }
    }
    alerts(types: [STOP]) {
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
        ... on Stop {
          gtfsId
        }
      }
    }
    stoptimes: stoptimesWithoutPatterns(
      startTime: $startTime
      timeRange: $timeRange
      numberOfDepartures: 100
      omitCanceled: false
    ) {
      serviceDay
      scheduledDeparture
      headsign
      realtimeState
      trip {
        tripHeadsign
        route {
          gtfsId
          type
          color
          mode
          shortName
        }
      }
    }
  }
`;
