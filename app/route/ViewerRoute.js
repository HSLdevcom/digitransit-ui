import Relay from 'react-relay';

export default class ViewerRoute extends Relay.Route {
  static queries = {
    alerts: () => Relay.QL`
      query {
        viewer
      }
   `,
  };
  static routeName = 'ViewerRoute';
}
