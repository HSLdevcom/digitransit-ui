import { graphql } from 'react-relay';

export default graphql`
  fragment CanceledDeparturesFragment on Pattern
  @relay(plural: true)
  @argumentDefinitions(serviceDateRanges: { type: "[LocalDateRangeInput!]" }) {
    code
    stops {
      name
    }
    canceledTrips(serviceDateRanges: $serviceDateRanges) {
      serviceDate
      trip {
        gtfsId
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
