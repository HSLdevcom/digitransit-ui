import { createFragmentContainer, graphql } from 'react-relay';
import StopCardHeader from './StopCardHeader';

export default createFragmentContainer(StopCardHeader, {
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
