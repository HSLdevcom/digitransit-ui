import { graphql } from 'react-relay';

export default graphql`
  fragment CanceledTripNodeFieldsFragment on TripOnServiceDate {
    start {
      stopLocation {
        ... on Stop {
          name
        }
      }
      schedule {
        time {
          ... on ArrivalDepartureTime {
            departure
          }
        }
      }
    }
    end {
      stopLocation {
        ... on Stop {
          name
        }
      }
    }
    trip {
      tripId: id
      pattern {
        code
        headsign
      }
      directionId
      route {
        gtfsId
        shortName
      }
    }
  }
`;
