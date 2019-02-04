import Relay from 'react-relay/classic';

export default class ParkAndRideHubRoute extends Relay.Route {
  static queries = {
    facilities: () => Relay.QL`
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
