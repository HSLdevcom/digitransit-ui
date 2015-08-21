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
      stopTimesToday: stoptimesForServiceDate(date: $date) {
        pattern {
          route {
            gtfsId
            shortName
            longName
            type
            color
          }
          headsign
        }
        stoptimes {
          scheduledDeparture
          realtimeDeparture
          realtime
        }
      }
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

module.exports = {
  StopQueries: StopQueries,
  StopPageFragments: StopPageFragments,
  StopCardHeaderFragments: StopCardHeaderFragments,
};
