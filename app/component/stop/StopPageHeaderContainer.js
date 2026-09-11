import { createFragmentContainer, graphql } from 'react-relay';

import StopPageHeader from './StopPageHeader';

export default createFragmentContainer(StopPageHeader, {
  stop: graphql`
    fragment StopPageHeaderContainer_stop on Stop {
      ...StopCardHeaderContainer_stop
    }
  `,
});
