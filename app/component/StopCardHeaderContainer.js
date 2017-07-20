import { createFragmentContainer, graphql } from 'react-relay/compat';
import StopCardHeader from './StopCardHeader';

export default createFragmentContainer(StopCardHeader, {
  stop: graphql`
    fragment StopCardHeaderContainer_stop on Stop {
      gtfsId
      name
      code
      desc
    }
  `,
});
