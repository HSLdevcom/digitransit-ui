import Relay from 'react-relay';

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
  StopQueries: StopQueries,
  StopMapQueries: StopMapQueries,
  StopPageFragments: StopPageFragments,
  StopMapPageFragments: StopMapPageFragments,
  StopCardHeaderFragments: StopCardHeaderFragments,
  DepartureListFragments: DepartureListFragments,
};
