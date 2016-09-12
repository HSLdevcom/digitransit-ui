import Relay from 'react-relay';

export default class ViewerRoute extends Relay.Route {
  static queries = {
    // TODO: The name of this property is madness
    alerts: () => Relay.QL`
      query {
        viewer
      }
   `,
  };
  static routeName = 'ViewerRoute';
}
