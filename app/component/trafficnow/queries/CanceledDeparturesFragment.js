import { graphql } from 'react-relay';

export default graphql`
  fragment CanceledDeparturesFragment on Pattern
  @relay(plural: true)
  @argumentDefinitions(
    runningTimeRanges: { type: "[OffsetDateTimeRangeInput!]" }
  ) {
    code
    headsign
    stops {
      name
    }
    canceledTrips(runningTimeRanges: $runningTimeRanges) {
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
