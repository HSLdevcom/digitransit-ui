import Relay from 'react-relay';

export default class StopMarkerLayerRoute extends Relay.Route {
  static queries = {
    stopsInRectangle: (Component, variables) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('stopsInRectangle', {
            minLat: variables.minLat,
            minLon: variables.minLon,
            maxLat: variables.maxLat,
            maxLon: variables.maxLon,
            agency: variables.agency,
          })}
        }
      }
    `,
  };
  static paramDefinitions = {
    minLat: { required: true },
    minLon: { required: true },
    maxLat: { required: true },
    maxLon: { required: true },
    agency: { required: false },
  };
  static routeName = 'StopMarkerLayerRoute';
}
