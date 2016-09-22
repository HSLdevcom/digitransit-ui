import Relay from 'react-relay';

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
