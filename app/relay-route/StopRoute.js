import Relay from 'react-relay';

export default class StopRoute extends Relay.Route {
/* eslint-disable graphql/template-strings */
  static queries = {
    stop: () => Relay.QL`
      query {
        stop(id: $stopId)
      }
    `,
  };
/* eslint-enable graphql/template-strings */
  static paramDefinitions = {
    stopId: { required: true },
    date: { required: true },
  };
  static routeName = 'StopRoute';
}
