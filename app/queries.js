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
      id
      gtfsId
      name
      code
      desc
      lat
      lon
    }
  `,
};

module.exports = {
  StopQueries: StopQueries,
  StopPageFragments: StopPageFragments,
}
