import Relay from 'react-relay';

var IndexQueries = {
  stops: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('stops')}
      }
    }
  `,
  stopsInRectangle: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('stopsInRectangle')}
      }
    }
  `,
}

var MapPageQueries = {
  stopsInRectangle: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('stopsInRectangle')}
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
  stopsInRectangle: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('stopsInRectangle')}
      }
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
  stopsInRectangle: (Component) => Relay.QL`
    query {
      viewer {
        ${Component.getFragment('stopsInRectangle')}
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
  stopsInRectangle: () => Relay.QL`
    fragment on QueryType {
      ${require('./component/map/stop-marker-container').getFragment('stopsInRectangle')}
    }
  `,
}

var MapPageFragments = {
  stopsInRectangle: () => Relay.QL`
    fragment on QueryType {
      ${require('./component/map/stop-marker-container').getFragment('stopsInRectangle')}
    }
  `,
}

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
}

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
  stopsInRectangle: () => Relay.QL`
    fragment on QueryType {
      ${require('./component/map/stop-marker-container').getFragment('stopsInRectangle')}
    }
  `
};

var StopMapPageFragments = {
  stop: () =>  Relay.QL`
    fragment on Stop {
      lat
      lon
      ${require('./component/stop-cards/stop-card-header').getFragment('stop')}
    }
  `,
  stopsInRectangle: () => Relay.QL`
    fragment on QueryType {
      ${require('./component/map/stop-marker-container').getFragment('stopsInRectangle')}
    }
  `
};

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
  MapPageQueries: MapPageQueries,
  StopQueries: StopQueries,
  StopMapQueries: StopMapQueries,
  IndexPageFragments: IndexPageFragments,
  MapPageFragments: MapPageFragments,
  StopListContainerFragments: StopListContainerFragments,
  StopPageFragments: StopPageFragments,
  StopMarkerContainerFragments: StopMarkerContainerFragments,
  StopMapPageFragments: StopMapPageFragments,
  StopCardHeaderFragments: StopCardHeaderFragments,
  DepartureListFragments: DepartureListFragments,
};
