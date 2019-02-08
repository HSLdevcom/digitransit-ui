import Relay from 'react-relay/classic';

export default class RoutesRoute extends Relay.Route {
  static queries = {
    routes: (Component, variables) => Relay.QL`
      query ($ids: [String]){
        routes (ids:$ids) {
          ${Component.getFragment('routes', {
            ids: variables.ids,
          })}
    }}`,
  };

  static paramDefinitions = {
    ids: { required: true },
  };

  static routeName = 'RoutesRoute';
}
