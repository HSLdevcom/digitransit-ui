import Relay from 'react-relay/classic';

export default class FuzzyTripRoute extends Relay.Route {
  static queries = {
    trip: (Component, variables) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('trip', {
            route: variables.route,
            direction: variables.direction,
            date: variables.date,
            time: variables.time,
          })}
        }
      }
    `,
  };

  static paramDefinitions = {
    route: { required: true },
    direction: { required: true },
    time: { required: true },
    date: { required: true },
  };

  static routeName = 'FuzzyTripRoute';
}
