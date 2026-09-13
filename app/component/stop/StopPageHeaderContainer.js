import { createFragmentContainer, graphql } from 'react-relay';

import StopPageHeader from './StopPageHeader.jsx';

export default createFragmentContainer(StopPageHeader, {
  stop: graphql`
    fragment StopPageHeaderContainer_stop on Stop {
      ...StopCardHeaderContainer_stop
    }
  `,
});
