import { graphql } from 'react-relay';

export default graphql`
  fragment RoutePatternSelectContainerFragment_route on Route
  @argumentDefinitions(date: { type: "String" }) {
    shortName
    mode
    type
    color
    gtfsId
    patterns {
      code
      directionId
      headsign
      stops {
        name
      }
      activeDates: trips {
        serviceId
        day: activeDates
      }
      tripsForDate: tripsForDate(serviceDate: $date) {
        stoptimes: stoptimesForDate(serviceDate: $date) {
          scheduledDeparture
          serviceDay
        }
      }
    }
  }
`;
