import React from 'react';
import Relay from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { routerShape, locationShape } from 'react-router';

import Modal from './Modal';
import ViewerRoute from '../route/ViewerRoute';
import DisruptionListContainer from './DisruptionListContainer';
import ComponentUsageExample from './ComponentUsageExample';
import { isBrowser } from '../util/browser';

function DisruptionInfo(props, context) {
  const isOpen = () => (context.location.state ? context.location.state.disruptionInfoOpen : false);

  const toggleVisibility = () => {
    if (isOpen()) {
      context.router.goBack();
    } else {
      context.router.push({
        ...location,
        state: {
          ...location.state,
          disruptionInfoOpen: true,
        },
      });
    }
  };

  if (isBrowser && isOpen()) {
    return (
      <Modal
        open
        title={
          <FormattedMessage id="disruption-info" defaultMessage="Disruption info" />}
        toggleVisibility={toggleVisibility}
      >
        <Relay.RootContainer
          Component={DisruptionListContainer}
          forceFetch
          route={new ViewerRoute()}
          renderLoading={() => <div className="spinner-loader" />}
        />
      </Modal>);
  }
  return <div />;
}


DisruptionInfo.contextTypes = {
  router: routerShape.isRequired,
  location: locationShape.isRequired,
};

DisruptionInfo.description = () =>
  <div>
    <p>
      Modal that shows all available disruption info.
      Opened by DisruptionInfoButton.
      <strong>Deprecated:</strong> Will be removed in short future in favor of announcements page.
    </p>
    <ComponentUsageExample>
      <DisruptionInfo />
    </ComponentUsageExample>
  </div>;

export default DisruptionInfo;
