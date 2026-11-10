import { graphql } from 'react-relay';

export const StopPageMapFragment = graphql`
  fragment StopPageMapFragment on Stop
  @argumentDefinitions(
    startOfDay: { type: "Long" }
    startTime: { type: "Long" }
    timeRange: { type: "Int", defaultValue: 7776000 } # 90 days in seconds
  ) {
    lat
    lon
    platformCode
    name
    code
    desc
    vehicleMode
    locationType
    gtfsId
    alerts(types: [STOP, ROUTES]) {
      alertEffect
      alertSeverityLevel
      effectiveStartDate
      effectiveEndDate
    }
    serviceToday: stoptimesWithoutPatterns(
      startTime: $startOfDay
      timeRange: 86400 # 1 day in seconds
      numberOfDepartures: 1
      omitCanceled: true
    ) {
      serviceDay
    }
    stoptimesWithoutPatterns(
      startTime: $startTime
      timeRange: $timeRange
      numberOfDepartures: 1
      omitCanceled: true
    ) {
      serviceDay
    }
  }
`;
