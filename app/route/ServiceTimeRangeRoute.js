import Relay from 'react-relay';

export default class ServiceTimeRangRoute extends Relay.Route {
  static queries = {
    serviceTimeRange: () => Relay.QL`
      query {
        viewer
      }
   `,
  };
  static routeName = 'ServiceTimeRangRoute';
}
