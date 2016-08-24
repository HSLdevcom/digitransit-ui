import Relay from 'react-relay';
import StopCardContainer from './component/stop-cards/StopCardContainer';
/* eslint-disable global-require*/

export const StopMarkerPopupFragments = {
  stop: ({ date }) => Relay.QL`
    fragment on Stop{
      gtfsId
      lat
      lon
      name
      ${StopCardContainer.getFragment('stop', { date })}
    }
  `,
  terminal: ({ date }) => Relay.QL`
    fragment on Stop{
      gtfsId
      lat
      lon
      name
      ${StopCardContainer.getFragment('stop', { date })}
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
        mode
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
      plan(
        from: $from,
        to: $to,
        numItineraries: $numItineraries,
        walkReluctance: $walkReluctance,
        walkBoardCost: $walkBoardCost,
        minTransferTime: $minTransferTime,
        walkSpeed: $walkSpeed,
        maxWalkDistance:
        $maxWalkDistance,
        wheelchair: $wheelchair,
        disableRemainingWeightHeuristic:
        $disableRemainingWeightHeuristic,
        arriveBy: $arriveBy,
        preferred: $preferred
      ) {
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
        ${Component.getFragment('plan', variables)}
      }
    }`,
  };
  static paramDefinitions = {
  };
  static routeName = 'PlanListContainerRoute';
}

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
