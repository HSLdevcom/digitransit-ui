import React from 'react';
import Relay from 'react-relay';
import DisruptionInfoRoute from './DisruptionInfoRoute';
import { open } from '../../action/DisruptionInfoAction';
import DisruptionInfoButton from './DisruptionInfoButton';

function DisruptionInfoButtonContainer() {
  if (typeof window !== 'undefined') {
    return (
      <Relay.RootContainer
        Component={DisruptionInfoButton}
        forceFetch
        route={new DisruptionInfoRoute()}
        renderFetched={(data) => (
          <DisruptionInfoButton
            {...data}
            toggleDisruptionInfo={() => context.executeAction(open)}
          />)
        }
      />);
  }
  return <div />;
}

export default DisruptionInfoButtonContainer;
