import Relay, { Route } from 'react-relay/classic';

export default class TripRoute extends Route {
  static queries = {
    trip: (Component, variables) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('trip', {
            id: variables.id,
            route: variables.route,
          })}
        }
      }
    `,
  };

  static paramDefinitions = {
    id: { required: true },
    route: { required: false },
  };

  static routeName = 'TripRoute';
}
