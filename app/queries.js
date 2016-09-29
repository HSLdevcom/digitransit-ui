import Relay from 'react-relay';

export const RouteMarkerPopupFragments = {
  trip: () => Relay.QL`
    fragment on QueryType {
      fuzzyTrip(route: $route, direction: $direction, time: $time, date: $date) {
        gtfsId
        pattern {
          code
          headsign
          stops {
            name
          }
        }
      }
      route(id: $route) {
        gtfsId
        mode
        shortName
        longName
      }
    }
  `,
};
