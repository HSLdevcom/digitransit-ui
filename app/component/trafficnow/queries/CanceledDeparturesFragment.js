import { graphql } from 'react-relay';

export default graphql`
  fragment CanceledDeparturesFragment on Pattern
  @relay(plural: true)
  @argumentDefinitions(serviceDateRanges: { type: "[LocalDateRangeInput!]" }) {
    stops {
      name
    }
    canceledTrips(serviceDateRanges: $serviceDateRanges) {
      serviceDate
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
