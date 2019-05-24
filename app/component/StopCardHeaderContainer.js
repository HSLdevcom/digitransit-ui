import connectToStores from 'fluxible-addons-react/connectToStores';
import Relay from 'react-relay/classic';

import StopCardHeader from './StopCardHeader';
import { StopAlertsQuery } from '../util/alertQueries';

export default Relay.createContainer(
  connectToStores(StopCardHeader, ['TimeStore'], context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    fragments: {
      stop: () => Relay.QL`
      fragment on Stop {
        gtfsId
        name
        code
        desc
        zoneId
        ${StopAlertsQuery}
      }
    `,
    },
  },
);
