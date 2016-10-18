import React from 'react';
import Relay from 'react-relay';
import config from '../../config';
import StopCardHeader from './StopCardHeader';

export default Relay.createContainer(StopCardHeader, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        gtfsId
        name
        code
        desc
      }
    `,
  },
});
