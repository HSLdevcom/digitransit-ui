import { graphql } from 'react-relay';
import './CanceledTripsPatternFragment';

export default graphql`
  query CanceledTripsForModeQuery(
    $mode: TransitMode!
    $runningTimeRanges: [OffsetDateTimeRangeInput!]
  ) {
    canceledTripsSummary(
      filters: {
        include: { modes: [$mode], runningTimeRanges: $runningTimeRanges }
      }
    ) {
      routes {
        cancellationCount
        route {
          id
          gtfsId
          shortName
          mode
        }
        patterns {
          cancellationCount
          pattern {
            code
            ...CanceledTripsPatternFragment
              @arguments(runningTimeRanges: $runningTimeRanges)
          }
        }
      }
    }
  }
`;
