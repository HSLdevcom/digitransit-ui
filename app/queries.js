import Relay from 'react-relay';

var StopQueries = {
  stop: () => Relay.QL`
    query  {
      stop(id: $stopId)
    }
  `,
};

class TripRoute extends Relay.Route {
  static queries = {
    pattern: () => Relay.QL`query {
        trip(id: $id)
    }`,
  }
  static paramDefinitions = {
    id: {required: true},
  }
  static routeName = "TripRoute"
}

var TripPatternFragments = {
  pattern: () => Relay.QL`
    fragment on Trip {
      pattern {
        ${require('./component/map/route-line').getFragment('pattern')}
      }
    }
  `,
};

var RouteQueries = {
  pattern: () => Relay.QL`
    query {
      pattern(id: $routeId)
    }
  `,
};

class RouteListContainerRoute extends Relay.Route {
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
  static routeName = 'RouteListContainerRoute'
}

var RouteListContainerFragments = {
  stops: () => Relay.QL`
    fragment on QueryType {
      stopsByRadius(lat: $lat, lon: $lon, radius: $radius, agency: $agency, first: $numberOfStops) {
        edges {
          node {
            stop {
              gtfsId
              name
              code
              desc
              stoptimes: stoptimesForPatterns(numberOfDepartures:1) {
                pattern {
                  headsign
                  route {
                    gtfsId
                    type
                  }
                }
                ${require('./component/departure/departure-list-container').getFragment('stoptimes')}
              }
            }
            distance
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
};

var TripQueries = {
  trip: () => Relay.QL`
    query {
      trip(id: $tripId)
    }
  `,
};

class StopRoute extends Relay.Route {
  static queries = StopQueries
  static paramDefinitions = {
    stopId: {required: true},
  }
  static routeName = 'StopRoute'
}


var RoutePageFragments = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      ${require('./component/route/route-header-container').getFragment('pattern')}
      ${require('./component/route/route-map-container').getFragment('pattern')}
      ${require('./component/route/route-stop-list-container').getFragment('pattern')}
    }
  `,
};

var RouteHeaderFragments = {
  pattern: () => Relay.QL`
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
  pattern: () => Relay.QL`
    fragment on Pattern {
      route {
        type
      }
      stops {
        gtfsId
        lat
        lon
        name
        desc
        code
      }
    }
  `,
};

var RouteMapFragments = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      code
      stops {
        lat
        lon
        name
        gtfsId
        ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
      }
      ${require('./component/map/route-line').getFragment('pattern')}
    }
  `,
};

var RouteLineFragments = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      geometry {
        lat
        lon
      }
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
              ${require('./component/stop-cards/stop-card-container').getFragment('stop')}
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
        stops(ids: $ids) {
          ${Component.getFragment('stops', {
          ids: variables.ids,
        })}
      }
    }`,
  }
  static paramDefinitions = {
    ids: {required: true},
  }
  static routeName = 'FavouriteStopListContainerRoute'
}

var FavouriteStopListContainerFragments = {
  stops: () => Relay.QL`
    fragment on Stop @relay(plural:true){
      gtfsId
      ${require('./component/stop-cards/stop-card-container').getFragment('stop')}
    }
  `,
};

var StopCardContainerFragments = {
  stop: () => Relay.QL`
    fragment on Stop{
      gtfsId
      stoptimes: stoptimesForServiceDate(date: $date) {
        ${require('./component/departure/departure-list-container').getFragment('stoptimes')}
      }
      ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
    }`
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
      stoptimes: stoptimesForServiceDate(date: $date) {
        ${require('./component/departure/departure-list-container').getFragment('stoptimes')}
      }
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

class StopMarkerLayerRoute extends Relay.Route {
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
  static routeName = 'StopMarkerLayerRoute'
}

var StopMarkerLayerFragments = {
  stopsInRectangle: (variables) => Relay.QL`
    fragment on QueryType {
      stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon, agency: $agency) {
        lat
        lon
        gtfsId
        name
        routes {
          type
        }
      }
    }
  `,
}

var StopMarkerPopupFragments = {
  stop: () => Relay.QL`
    fragment on Stop{
      gtfsId
      lat
      lon
      name
      ${require('./component/stop-cards/stop-card-container').getFragment('stop')}
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
  stoptimes: () => Relay.QL`
    fragment on StoptimesInPattern @relay(plural:true) {
      pattern {
        alerts {
          effectiveStartDate
          effectiveEndDate
        }
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
        stop {
          code
        }
      }
    }
  `,
}

var TripPageFragments = {
  trip: () => Relay.QL`
    fragment on Trip {
      pattern {
        code
        ${require('./component/route/route-header-container').getFragment('pattern')}
        ${require('./component/route/route-map-container').getFragment('pattern')}
      }
      stoptimes {
        scheduledDeparture
      }
      gtfsId
      ${require('./component/trip/trip-stop-list-container').getFragment('trip')}
    }
  `,
}
var TripStopListFragments = {
  trip: () => Relay.QL`
    fragment on Trip {
      route {
        type
      }
      stoptimes        {
        stop{
          gtfsId
          name
          desc
          code
          lat
          lon
        }
        realtimeDeparture
        realtime
      }
    }
  `,
};

class FuzzyTripRoute extends Relay.Route {
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
  static routeName = 'FuzzyTripRoute'
}

var TripLinkFragments = {
  trip: () => Relay.QL`
    fragment on QueryType {
      trip: fuzzyTrip(route: $route, direction: $direction, time: $time, date: $date) {
        gtfsId
      }
    }
  `,
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

class FavouriteRouteRowRoute extends Relay.Route {
  static queries = {
      routes: (Component, variables) => Relay.QL`
        query {
          routes (ids:$ids) {
            ${Component.getFragment('routes', {
            ids: variables.ids
        })}
      }}`,
  }
  static paramDefinitions = {
    ids: {required: true},
  }
  static routeName = 'FavouriteRouteRowRoute'
}

var FavouriteRouteRowFragments = {
    routes: () => Relay.QL`
      fragment on Route @relay(plural:true) {
        patterns {
            code
        }
        gtfsId
        shortName
        longName
        type
      }
   `,
};

class DisruptionInfoRoute extends Relay.Route {
  static queries = {
    alerts: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('alerts')}
      }
    }
   `,
  }
  static routeName = 'DisruptionInfoRoute'
}

var DisruptionListContainerFragments = {
  alerts: () => Relay.QL`
  fragment on QueryType {
    alerts {
      id
      alertHeaderText
      alertDescriptionText
      effectiveStartDate
      effectiveEndDate
      route {
        shortName
        type
      }
    }
  }
  `,
};

var DisruptionInfoButtonFragments = {
  alerts: () => Relay.QL`
  fragment on QueryType {
    alerts {
      id
    }
  }
  `,
};

module.exports = {
  StopQueries: StopQueries,
  TripRoute: TripRoute,
  TripPatternFragments: TripPatternFragments,
  RouteQueries: RouteQueries,
  RouteListContainerRoute: RouteListContainerRoute,
  RouteListContainerFragments: RouteListContainerFragments,
  TripQueries: TripQueries,
  StopRoute: StopRoute,
  RoutePageFragments: RoutePageFragments,
  RouteHeaderFragments: RouteHeaderFragments,
  RouteStopListFragments: RouteStopListFragments,
  RouteMapFragments: RouteMapFragments,
  RouteLineFragments: RouteLineFragments,
  TripStopListFragments: TripStopListFragments,
  StopListContainerRoute: StopListContainerRoute,
  NearStopListContainerFragments: NearStopListContainerFragments,
  FavouriteRouteRowRoute:FavouriteRouteRowRoute,
  FavouriteRouteRowFragments:FavouriteRouteRowFragments,
  FavouriteStopListContainerFragments: FavouriteStopListContainerFragments,
  StopCardContainerFragments: StopCardContainerFragments,
  FavouriteStopListContainerRoute: FavouriteStopListContainerRoute,
  StopPageFragments: StopPageFragments,
  StopMarkerLayerRoute: StopMarkerLayerRoute,
  StopMarkerLayerFragments: StopMarkerLayerFragments,
  StopMarkerPopupFragments: StopMarkerPopupFragments,
  StopMapPageFragments: StopMapPageFragments,
  StopCardHeaderFragments: StopCardHeaderFragments,
  DepartureListFragments: DepartureListFragments,
  TripPageFragments: TripPageFragments,
  FuzzyTripRoute: FuzzyTripRoute,
  TripLinkFragments: TripLinkFragments,
  RouteMarkerPopupFragments: RouteMarkerPopupFragments,
  DisruptionInfoRoute: DisruptionInfoRoute,
  DisruptionListContainerFragments: DisruptionListContainerFragments,
  DisruptionInfoButtonFragments: DisruptionInfoButtonFragments,
};
