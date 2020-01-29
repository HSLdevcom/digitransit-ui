import connectToStores from 'fluxible-addons-react/connectToStores';
import { createFragmentContainer, graphql } from 'react-relay/compat';

import StopCardHeader from './StopCardHeader';
import { StopAlertsQuery } from '../util/alertQueries';

export default createFragmentContainer(
  connectToStores(StopCardHeader, ['TimeStore'], context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    stop: graphql`
    fragment StopCardHeaderContainer_stop on Stop {
      gtfsId
      name
      code
      desc
      zoneId
      ${StopAlertsQuery}
    }
  `,
  },
);
