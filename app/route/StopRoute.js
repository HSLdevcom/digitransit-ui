import Relay from 'react-relay';

export default class StopRoute extends Relay.Route {
  static queries = {
    stop: () => Relay.QL`
      query ($stopId: String!){
        stop(id: $stopId)
      }
    `,
  };
  static paramDefinitions = {
    stopId: { required: true },
  };
  static routeName = 'StopRoute';
}
