import { createFragmentContainer, graphql } from 'react-relay';

import StopCardHeader from './StopCardHeader';
import { withCurrentTime } from '../../hooks/TimeContext';

export default createFragmentContainer(withCurrentTime(StopCardHeader), {
  stop: graphql`
    fragment StopCardHeaderContainer_stop on Stop {
      gtfsId
      name
      code
      desc
      zoneId
      vehicleMode
      alerts {
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
      }
      lat
      lon
      stops {
        name
        desc
        zoneId
      }
    }
  `,
});
