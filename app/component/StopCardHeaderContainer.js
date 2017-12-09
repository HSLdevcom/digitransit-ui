import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
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
