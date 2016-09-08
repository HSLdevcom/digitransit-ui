import Relay from 'react-relay';
/* eslint-disable global-require*/

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
