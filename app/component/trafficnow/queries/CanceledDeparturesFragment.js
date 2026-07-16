import { graphql } from 'react-relay';

export default graphql`
  fragment CanceledDeparturesFragment on Pattern
  @relay(plural: true)
  @argumentDefinitions(serviceDateRanges: { type: "[LocalDateRangeInput!]" }) {
    canceledTrips(serviceDateRanges: $serviceDateRanges) {
      trip {
        stoptimes {
          scheduledDeparture
        }
        directionId
        pattern {
          code
          headsign
        }
        route {
          gtfsId
          shortName
        }
      }
    }
  }
`;
