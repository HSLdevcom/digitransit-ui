import Relay from 'react-relay/classic';

export default class StopListRoute extends Relay.Route {
  static queries = {
    stops: (Component, variables) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('stops', {
            lat: variables.lat,
            lon: variables.lon,
            date: variables.date,
          })}
        }
      }
    `,
  };

  static paramDefinitions = {
    lat: { required: true },
    lon: { required: true },
    date: { required: true },
  };

  static routeName = 'StopListRoute';
}
