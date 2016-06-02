import Relay from 'react-relay';

export const TerminalQueries = {
  terminal: () => Relay.QL`
    query  {
      station(id: $terminalId)
    }
  `,
};

export class TerminalRoute extends Relay.Route {
  static queries = TerminalQueries;
  static paramDefinitions = {
    terminalId: { required: true },
  };
  static routeName = 'TerminalRoute';
}

export const TerminalMarkerPopupFragments = {
  terminal: () => Relay.QL`
    fragment on Stop{
      gtfsId
      lat
      lon
      name
      desc
      stops {
        gtfsId
        platformCode
        routes {
          shortName
          longName
          type
        }
      }
    }
  `,
};

export const StopQueries = {
  stop: () => Relay.QL`
    query  {
      stop(id: $stopId)
    }
  `,
};

export class TripRoute extends Relay.Route {
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

export const TripPatternFragments = {
  pattern: () => Relay.QL`
    fragment on Trip {
      pattern {
        ${require('./component/map/route/route-line').getFragment('pattern')}
      }
    }
  `,
};

export const RouteQueries = {
  pattern: () => Relay.QL`
    query {
      pattern(id: $routeId)
    }
  `,
};

export const TripQueries = {
  trip: () => Relay.QL`
    query {
      trip(id: $tripId)
    }
  `,
};

export const RoutePageFragments = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      route {
        shortName
        longName
      }
      ${require('./component/route/route-header-container').getFragment('pattern')}
      ${require('./component/route/route-map-container').getFragment('pattern')}
      ${require('./component/route/route-stop-list-container').getFragment('pattern')}
    }
  `,
};

export const RouteHeaderFragments = {
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

export const RouteStopListFragments = {
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

export const RouteMapFragments = {
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
      ${require('./component/map/route/route-line').getFragment('pattern')}
    }
  `,
};

export const RouteLineFragments = {
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

export class StopListContainerRoute extends Relay.Route {
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
  static routeName = 'StopListContainerRoute';
}

export const NearestStopListContainerFragments = {
  stops: ({ date }) => Relay.QL`
    fragment on QueryType {
      stopsByRadius(lat: $lat, lon: $lon, radius: $radius, agency: $agency, first: $numberOfStops) {
        edges{
          node {
            stop {
              gtfsId
              ${require('./component/stop-cards/stop-card-container').getFragment('stop', { date })}
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

export class FavouriteStopListContainerRoute extends Relay.Route {
  static queries = {
    stops: (Component, variables) => Relay.QL`
      query {
        stops(ids: $ids) {
          ${Component.getFragment('stops', {
            ids: variables.ids,
            date: variables.date,
          })}
        }
      }
    `,
  };
  static paramDefinitions = {
    ids: { required: true },
    date: { required: true },
  };
  static routeName = 'FavouriteStopListContainerRoute';
}

export const FavouriteStopListContainerFragments = {
  stops: ({ date }) => Relay.QL`
    fragment on Stop @relay(plural:true){
      gtfsId
      ${require('./component/stop-cards/stop-card-container').getFragment('stop', { date })}
    }
  `,
};

export const StopCardContainerFragments = {
  stop: () => Relay.QL`
    fragment on Stop{
      gtfsId
      stoptimes: stoptimesForServiceDate(date: $date) {
        ${require('./component/departure/departure-list-container').getFragment('stoptimes')}
      }
      ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
    }
  `,
};

export const StopPageFragments = {
  stop: () => Relay.QL`
    fragment on Stop {
      lat
      lon
      name
      code
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

export const StopMapPageFragments = {
  stop: () => Relay.QL`
    fragment on Stop {
      lat
      lon
      ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
    }
  `,
};

export class StopMarkerLayerRoute extends Relay.Route {
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
  };
  static paramDefinitions = {
    minLat: { required: true },
    minLon: { required: true },
    maxLat: { required: true },
    maxLon: { required: true },
  };
  static routeName = 'StopMarkerLayerRoute';
}

export const StopMarkerLayerFragments = {
  stopsInRectangle: () => Relay.QL`
    fragment on QueryType {
      stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon, agency: $agency) {
        lat
        lon
        gtfsId
        name
        locationType
        platformCode
        parentStation {
          gtfsId
          name
          lat
          lon
          stops {
            gtfsId
            lat
            lon
          }
        }
        routes {
          type
        }
      }
    }
  `,
};

export const StopMarkerPopupFragments = {
  stop: ({ date }) => Relay.QL`
    fragment on Stop{
      gtfsId
      lat
      lon
      name
      ${require('./component/stop-cards/stop-card-container').getFragment('stop', { date })}
    }
  `,
};

export const StopCardHeaderFragments = {
  stop: () => Relay.QL`
    fragment on Stop {
      gtfsId
      name
      code
      desc
    }
  `,
};

export const StopAtDistanceListContainerFragments = {
  stopAtDistance: () => Relay.QL`
  fragment on stopAtDistance {
    distance
    stop {
      stoptimes: stoptimesForPatterns(numberOfDepartures:2) {
        pattern {
          alerts {
            effectiveStartDate
            effectiveEndDate
            trip {
            gtfsId
            }
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
          realtimeState
          realtimeDeparture
          scheduledDeparture
          realtime
          serviceDay
          trip {
            gtfsId
          }
        }
      }
    }
  }
  `,
};

export const DepartureListFragments = {
  stoptimes: () => Relay.QL`
    fragment on StoptimesInPattern @relay(plural:true) {
      pattern {
        alerts {
          effectiveStartDate
          effectiveEndDate
          trip {
            gtfsId
          }
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
        realtimeState
        realtimeDeparture
        scheduledDeparture
        realtime
        serviceDay
        stop {
          code
        }
        trip {
          gtfsId
        }
      }
    }
  `,
};

export const CityBikeStatusQuery = Relay.QL`
query Test{
  bikeRentalStation(id: $id) {
    bikesAvailable
    spacesAvailable
  }
}`;

export const CityBikePopupFragments = {
  station: () => Relay.QL`
    fragment on BikeRentalStation {
      stationId
      name
      lat
      lon
      bikesAvailable
      spacesAvailable
    }
  `,
};

export const TripPageFragments = {
  trip: () => Relay.QL`
    fragment on Trip {
      pattern {
        code
        route {
          shortName
          longName
        }
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
};

export const TripStopListFragments = {
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

export class FuzzyTripRoute extends Relay.Route {
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
  };
  static paramDefinitions = {
    route: { required: true },
    direction: { required: true },
    time: { required: true },
    date: { required: true },
  };
  static routeName = 'FuzzyTripRoute';
}

export const TripLinkFragments = {
  trip: () => Relay.QL`
    fragment on QueryType {
      trip: fuzzyTrip(route: $route, direction: $direction, time: $time, date: $date) {
        gtfsId
      }
    }
  `,
};

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
        type
        shortName
        longName
      }
    }
  `,
};

export class FavouriteRouteListContainerRoute extends Relay.Route {
  static queries = {
    routes: (Component, variables) => Relay.QL`
      query {
        routes (ids:$ids) {
          ${Component.getFragment('routes', {
            ids: variables.ids,
          }
        )
      }
    }}`,
  };
  static paramDefinitions = {
    ids: { required: true },
  };
  static routeName = 'FavouriteRouteRowRoute';
}

export class FavouriteLocationContainerRoute extends Relay.Route {
  static queries = {
    plan: (Component, variables) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('plan', {
          from: variables.from,
          to: variables.to,
          maxWalkDistance: variables.maxWalkDistance,
          wheelchair: variables.wheelchair,
          preferred: variables.preferred,
          arriveBy: variables.arriveBy,
          disableRemainingWeightHeuristic: variables.disableRemainingWeightHeuristic,
        })}
      }
    }`,
  };
  static paramDefinitions = {
    from: { required: true },
    to: { required: true },
  };
  static routeName = 'FavouriteLocationsContainerRoute';
}

export const FavouriteLocationContainerFragments = {
  plan: () => Relay.QL`
    fragment on QueryType {
      plan(from: $from, to: $to, numItineraries: $numItineraries, walkReluctance: $walkReluctance, walkBoardCost: $walkBoardCost, minTransferTime: $minTransferTime, walkSpeed: $walkSpeed, maxWalkDistance: $maxWalkDistance, wheelchair: $wheelchair, disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic, arriveBy: $arriveBy, preferred: $preferred) {
        itineraries {
          startTime
          endTime
          legs {
            realTime
            transitLeg
            mode
            route {
              shortName
            }
          }
        }
      }
    }
  `,
};

export class SummaryPlanContainerRoute extends Relay.Route {
  static queries = {
    plan: (Component, variables) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('plan', {
          fromPlace: variables.fromPlace,
          toPlace: variables.toPlace,
          walkReluctance: variables.walkReluctance,
          modes: variables.modes,
          date: variables.date,
          time: variables.time,
          walkBoardCost: variables.walkBoardCost,
          walkSpeed: variables.walkSpeed,
          minTransferTime: variables.minTransferTime,
          numItineraries: variables.numItineraries,
          maxWalkDistance: variables.maxWalkDistance,
          wheelchair: variables.wheelchair,
          preferred: variables.preferred,
          arriveBy: variables.arriveBy,
          disableRemainingWeightHeuristic: variables.disableRemainingWeightHeuristic,
        })}
      }
    }`,
  };
  static paramDefinitions = {
  };
  static routeName = 'PlanListContainerRoute';
}

export const SummaryPlanContainerFragments = {
  plan: () => Relay.QL`
    fragment on QueryType {
      plan(fromPlace: $fromPlace, toPlace: $toPlace, numItineraries: $numItineraries, modes: $modes, date: $date, time: $time, walkReluctance: $walkReluctance, walkBoardCost: $walkBoardCost, minTransferTime: $minTransferTime, walkSpeed: $walkSpeed, maxWalkDistance: $maxWalkDistance, wheelchair: $wheelchair, disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic, arriveBy: $arriveBy, preferred: $preferred) {
        itineraries {
          walkDistance
          duration

          legs {
            mode
            agency {
              name
            }
            from {
              lat
              lon
              vertexType
              bikeRentalStation {
                stationId
              }
              stop {
                code
              }
            }
            to {
              lat
              lon
              vertexType
              bikeRentalStation {
                stationId
              }
              stop {
                code
              }
            }
            legGeometry {
              length
              points
            }
            intermediateStops {
              gtfsId
            }
            trip {
              gtfsId
            }
          }

          ${require('./component/summary/itinerary-summary-list-container').getFragment('itineraries')}
        }
      }
    }
  `,
};

export const ItinerarySummaryListContainerFragments = {
  itineraries: () => Relay.QL`
    fragment on Itinerary @relay(plural:true){
      walkDistance
      startTime
      endTime
      legs {
        realTime
        transitLeg
        startTime
        endTime
        mode
        distance
        duration
        rentedBike
        route {
          shortName
        }
      }
    }
  `,
};
