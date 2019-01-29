import Relay from 'react-relay/classic';

export default class PlanRoute extends Relay.Route {
  static queries = {
    plan: (Component, variables) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('plan', variables)}
        }
      }`,
  };

  static paramDefinitions = {};

  static routeName = 'PlanRoute';
}
