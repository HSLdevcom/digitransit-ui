import Relay from 'react-relay';

export default class TerminalRoute extends Relay.Route {
  static queries = {
    terminal: () => Relay.QL`
      query  {
        station(id: $terminalId)
      }
    `,
  };
  static paramDefinitions = {
    terminalId: { required: true },
  };
  static routeName = 'TerminalRoute';
}
