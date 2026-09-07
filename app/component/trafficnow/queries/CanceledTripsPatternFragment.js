import { graphql } from 'react-relay';
import './CanceledDeparturesFragment';

export default graphql`
  fragment CanceledTripsPatternFragment on Pattern
  @argumentDefinitions(
    runningTimeRanges: { type: "[OffsetDateTimeRangeInput!]" }
  ) {
    id
    code
    headsign
    stops {
      name
    }
    ...CanceledDeparturesFragment
      @arguments(runningTimeRanges: $runningTimeRanges)
  }
`;
