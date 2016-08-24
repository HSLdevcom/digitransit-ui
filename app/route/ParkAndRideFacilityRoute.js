import Relay from 'react-relay';

export default class ParkAndRideFacilityRoute extends Relay.Route {
  static queries = {
    facility: () => Relay.QL`
      query ($id: String!) {
        carPark(id: $id)
      }
    `,
  };
  static paramDefinitions = {
    id: { required: true },
  };
  static routeName = 'ParkAndRideFacilityRoute';
}
