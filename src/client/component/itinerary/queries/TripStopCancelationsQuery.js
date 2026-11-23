import { graphql } from 'react-relay';

export const tripStopCancelationsQuery = graphql`
  query TripStopCancelationsQuery($tripId: String!, $serviceDate: String!) {
    trip(id: $tripId) {
      gtfsId
      stoptimesForDate(serviceDate: $serviceDate) {
        realtimeState
        stop {
          gtfsId
        }
      }
    }
  }
`;
