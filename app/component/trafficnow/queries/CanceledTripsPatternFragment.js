import { graphql } from 'react-relay';

export default graphql`
  fragment CanceledTripsPatternFragment on Pattern
  @argumentDefinitions(serviceDateRanges: { type: "[LocalDateRangeInput!]" }) {
    id
    code
    headsign
    stops {
      name
    }
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
