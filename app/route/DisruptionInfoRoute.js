import Relay from 'react-relay';

export default class DisruptionInfoRoute extends Relay.Route {
  static queries = {
    alerts: () => Relay.QL`
      query {
        viewer
      }
   `,
  };
  static routeName = 'DisruptionInfoRoute';
}
