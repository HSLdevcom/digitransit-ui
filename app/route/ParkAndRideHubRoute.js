import Relay from 'react-relay';

export default class ParkAndRideHubRoute extends Relay.Route {
  static queries = {
    facility: () => Relay.QL`
      query ($stationIds: [String!]) {
        carParks(ids: $stationIds)
      }
    `,
  };
  static paramDefinitions = {
    stationIds: { required: true },
  };
  static routeName = 'ParkAndRideHubRoute';
}
