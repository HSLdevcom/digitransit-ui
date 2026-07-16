import { graphql } from 'react-relay';
import './CanceledDeparturesFragment';

export default graphql`
  fragment CanceledTripsPatternFragment on Pattern
  @argumentDefinitions(serviceDateRanges: { type: "[LocalDateRangeInput!]" }) {
    id
    code
    headsign
    stops {
      name
    }
    ...CanceledDeparturesFragment
      @arguments(serviceDateRanges: $serviceDateRanges)
  }
`;
