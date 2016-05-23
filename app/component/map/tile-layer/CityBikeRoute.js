import Relay from 'react-relay';

export default class CityBikeRoute extends Relay.Route {
  /* eslint-disable graphql/template-strings */
  static queries = {
    station: () => Relay.QL`
      query {
        bikeRentalStation(id: $stationId)
      }
    `,
  };
  /* eslint-enable graphql/template-strings */
  static paramDefinitions = {
    stationId: { required: true },
  };
  static routeName = 'CityBikeRoute';
}
