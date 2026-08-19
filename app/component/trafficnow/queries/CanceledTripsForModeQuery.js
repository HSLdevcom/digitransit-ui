import { graphql } from 'react-relay';
import './CanceledTripsPatternFragment';

export default graphql`
  query CanceledTripsForModeQuery(
    $mode: TransitMode!
    $serviceDateRanges: [LocalDateRangeInput!]!
  ) {
    canceledTripsSummary(
      filters: {
        include: { modes: [$mode], serviceDateRanges: $serviceDateRanges }
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
              @arguments(serviceDateRanges: $serviceDateRanges)
          }
        }
      }
    }
  }
`;
