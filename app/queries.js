import Relay from 'react-relay';

var IndexQueries = {
  stops: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('stops')}
      }
    }
  `,
}

var StopQueries = {
  stop: (Component) => Relay.QL`
    query  {
      stop(id: $stopId) {
        ${Component.getFragment('stop')},
      },
    }
  `,
};

var StopMapQueries = {
  stop: (Component) => Relay.QL`
    query  {
      stop(id: $stopId) {
        ${Component.getFragment('stop')},
      },
    }
  `,
};

var RouteQueries = {
  route: (Component) => Relay.QL`
    query {
      pattern(id: $routeId){
        ${Component.getFragment('route')}
      }
    }
  `,
};

var IndexPageFragments = {
  stops: () => Relay.QL`
    fragment on QueryType {
      ${require('./component/stop-cards/stop-card-list-container').getFragment('stops')}
    }
  `,
};

var RoutePageFragments = {
  route: () => Relay.QL`
    fragment on Pattern {
      ${require('./component/route/route-header-container').getFragment('route')}
      ${require('./component/route/route-map-container').getFragment('route')}
      ${require('./component/route/route-stop-list-container').getFragment('route')}
    }
  `,
};

var RouteHeaderFragments = {
  route: () => Relay.QL`
    fragment on Pattern {
      code
      headsign
      route {
        gtfsId
        type
        shortName
        longName
        patterns {
          code
        }
      }
      stops {
        name
      }
    }
  `,
};

var RouteStopListFragments = {
  route: () => Relay.QL`
    fragment on Pattern {
      route {
        type
      }
      stops {
        gtfsId
        name
        desc
        code
      }
    }
  `,
};

var RouteMapFragments = {
  route: () => Relay.QL`
    fragment on Pattern {
      geometry {
        lat
        lon
      }
      code
      route {
        type
      }
      stops {
        lat
        lon

      }
    }
  `,
};

var StopListContainerFragments = {
  stops: () => Relay.QL`
    fragment on QueryType {
      stopsByRadius(lat: $lat, lon: $lon, radius: $radius, agency: $agency) {
        stop {
          gtfsId
          ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
          ${require('./component/stop-cards/departure-list-container').getFragment('stop')}
        }
        distance
      }
    }
  `,
};

var StopPageFragments = {
  stop: () =>  Relay.QL`
    fragment on Stop {
      lat
      lon
      routes {
        gtfsId
        shortName
        longName
        type
        color
      }
      ${require('./component/stop-cards/departure-list-container').getFragment('stop')}
      ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
    }
  `,
};

var StopMapPageFragments = {
  stop: () =>  Relay.QL`
    fragment on Stop {
      lat
      lon
      ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
    }
  `,
};

class StopMarkerContainerRoute extends Relay.Route {
  static queries = {
    stopsInRectangle: (Component, variables) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('stopsInRectangle', {
            minLat: variables.minLat,
            minLon: variables.minLon,
            maxLat: variables.maxLat,
            maxLon: variables.maxLon,
          })}
        }
      }
    `,
  }
  static paramDefinitions = {
    minLat: {required: true},
    minLon: {required: true},
    maxLat: {required: true},
    maxLon: {required: true},
  }
  static routeName = 'StopMarkerContainerRoute'
}

var StopMarkerContainerFragments = {
  stopsInRectangle: (variables) => Relay.QL`
    fragment on QueryType {
      stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon, agency: $agency) {
        lat
        lon
        gtfsId
        name
        routes {
          gtfsId
          shortName
          type
        }
        ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
      }
    }
  `,
}

var StopCardHeaderFragments = {
  stop: () => Relay.QL`
    fragment on Stop {
      gtfsId
      name
      code
      desc
    }
  `,
};

var DepartureListFragments = {
  stop: () => Relay.QL`
    fragment on Stop {
      stopTimes: stoptimesForServiceDate(date: $date) {
        pattern {
          route {
            gtfsId
            shortName
            longName
            type
            color
          }
          code
          headsign
        }
        stoptimes {
          realtimeDeparture
          realtime
          serviceDay
        }
      }
    }
  `,
}

module.exports = {
  IndexQueries: IndexQueries,
  StopQueries: StopQueries,
  StopMapQueries: StopMapQueries,
  RouteQueries: RouteQueries,
  IndexPageFragments: IndexPageFragments,
  RoutePageFragments: RoutePageFragments,
  RouteHeaderFragments: RouteHeaderFragments,
  RouteStopListFragments: RouteStopListFragments,
  RouteMapFragments: RouteMapFragments,
  StopListContainerFragments: StopListContainerFragments,
  StopPageFragments: StopPageFragments,
  StopMarkerContainerRoute: StopMarkerContainerRoute,
  StopMarkerContainerFragments: StopMarkerContainerFragments,
  StopMapPageFragments: StopMapPageFragments,
  StopCardHeaderFragments: StopCardHeaderFragments,
  DepartureListFragments: DepartureListFragments,
};
