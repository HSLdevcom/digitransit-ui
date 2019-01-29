import Relay from 'react-relay/classic';

export default class TerminalRoute extends Relay.Route {
  static queries = {
    terminal: () => Relay.QL`
      query ($terminalId: String!){
        station(id: $terminalId)
      }
    `,
  };

  static paramDefinitions = {
    terminalId: { required: true },
  };

  static routeName = 'TerminalRoute';
}
