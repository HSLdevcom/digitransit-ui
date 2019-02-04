import Relay, { Route } from 'react-relay/classic';

export default class TripRoute extends Route {
  static queries = {
    pattern: () => Relay.QL`query {
        trip(id: $id)
    }`,
  };

  static paramDefinitions = {
    id: { required: true },
  };

  static routeName = 'TripRoute';
}
