import Relay from 'react-relay';

var StopQueries = {
  stop: (Component) => Relay.QL`
    query  {
      stop(id: $stopId)
    }
  `,
};

var RouteQueries = {
  route: (Component) => Relay.QL`
    query {
      pattern(id: $routeId)
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
        name
        gtfsId
        ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
      }
    }
  `,
};

class StopListContainerRoute extends Relay.Route {
  static queries = {
    stops: (Component, variables) => Relay.QL`
      query {
        viewer {
          ${Component.getFragment('stops', {
            lat: variables.lat,
            lon: variables.lon,
          })}
        }
      }
    `,
  }
  static paramDefinitions = {
    lat: {required: true},
    lon: {required: true},
  }
  static routeName = 'StopListContainerRoute'
}

var NearStopListContainerFragments = {
  stops: () => Relay.QL`
    fragment on QueryType {
      stopsByRadius(lat: $lat, lon: $lon, radius: $radius, agency: $agency, first: $numberOfStops) {
        edges{
          node {
            stop {
              gtfsId
              ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
              ${require('./component/stop-cards/departure-list-container').getFragment('stop')}
            }
            distance
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
};

class FavouriteStopListContainerRoute extends Relay.Route {
  static queries = {
      stops: (Component, variables) => Relay.QL`
      query {
  viewer {
    ${Component.getFragment('stops', {
      ids: variables.ids,
    })}
}
}
`,
}
static paramDefinitions = {
  ids: {required: true},
}
static routeName = 'FavouriteStopListContainerRoute'
}

var FavouriteStopListContainerFragments = {
    stops: () => Relay.QL`
      fragment on QueryType {
        stops(ids: $ids) {
          gtfsId
          ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
          ${require('./component/stop-cards/departure-list-container').getFragment('stop')}
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

class RouteMarkerPopupRoute extends Relay.Route {
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
  }
  static paramDefinitions = {
    route: {required: true},
    direction: {required: true},
    time: {required: true},
    date: {required: true},
  }
  static routeName = 'RouteMarkerPopupRoute'
}

var RouteMarkerPopupFragments = {
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
        type
        shortName
        longName
      }
    }
  `,
}

class DisruptionRowRoute extends Relay.Route {
  static queries = {
    routes: () => Relay.QL`query { routes(ids: $ids) }`,
  }
  static paramDefinitions = {
    ids: {required: true},
  }
  static routeName = 'DisruptionRowRoute'
}

var DisruptionRowFragments = {
  routes: () => Relay.QL`
    fragment on Route @relay(plural:true) {
      gtfsId
      type
      shortName
    }
  `,
};

module.exports = {
  StopQueries: StopQueries,
  RouteQueries: RouteQueries,
  RoutePageFragments: RoutePageFragments,
  RouteHeaderFragments: RouteHeaderFragments,
  RouteStopListFragments: RouteStopListFragments,
  RouteMapFragments: RouteMapFragments,
  StopListContainerRoute: StopListContainerRoute,
  NearStopListContainerFragments: NearStopListContainerFragments,
  FavouriteStopListContainerFragments: FavouriteStopListContainerFragments,
  FavouriteStopListContainerRoute: FavouriteStopListContainerRoute,
  StopPageFragments: StopPageFragments,
  StopMarkerContainerRoute: StopMarkerContainerRoute,
  StopMarkerContainerFragments: StopMarkerContainerFragments,
  StopMapPageFragments: StopMapPageFragments,
  StopCardHeaderFragments: StopCardHeaderFragments,
  DepartureListFragments: DepartureListFragments,
  RouteMarkerPopupRoute: RouteMarkerPopupRoute,
  RouteMarkerPopupFragments: RouteMarkerPopupFragments,
  DisruptionRowRoute: DisruptionRowRoute,
  DisruptionRowFragments: DisruptionRowFragments,
};
