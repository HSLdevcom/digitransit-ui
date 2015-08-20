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

var StopPage = Relay.createContainer(require('./page/stop'), {
  fragments: {
    stop: () =>  Relay.QL`
      fragment on Stop {
        id
        gtfsId
        name
        code
      }
    `,
  }
});

module.exports = {
  StopQueries: StopQueries,
  StopPage: StopPage,
}
