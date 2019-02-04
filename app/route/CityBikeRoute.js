import Relay from 'react-relay/classic';

export default class CityBikeRoute extends Relay.Route {
  static queries = {
    station: () => Relay.QL`
      query ($stationId: String!) {
        bikeRentalStation(id: $stationId)
      }
    `,
  };

  static paramDefinitions = {
    stationId: { required: true },
  };

  static routeName = 'CityBikeRoute';
}
