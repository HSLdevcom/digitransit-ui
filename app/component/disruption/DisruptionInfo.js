import React from 'react';
import Relay from 'react-relay';
import Modal from '../util/Modal';
import ViewerRoute from '../../route/ViewerRoute';
import { close } from '../../action/DisruptionInfoAction';
import DisruptionListContainer from './DisruptionListContainer';
import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import connectToStores from 'fluxible-addons-react/connectToStores';

function DisruptionInfo(props, context) {
  if (typeof window !== 'undefined' && props.open) {
    return (
      <Modal
        open={props.open}
        title={
          <FormattedMessage id="disruption-info" defaultMessage="Disruption Info" />}
        toggleVisibility={() => context.executeAction(close)}
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

DisruptionInfo.propTypes = {
  open: React.PropTypes.bool,
};

DisruptionInfo.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

DisruptionInfo.description = (
  <div>
    <p>
      Modal that shows all available disruption info.
      Activated via DisruptionInfoAction, used by DisruptionInfoButton.
      <strong>Deprecated:</strong> Will be removed in short future in favor of announcements page.
    </p>
    <ComponentUsageExample>
      <DisruptionInfo />
    </ComponentUsageExample>
  </div>);

export default connectToStores(DisruptionInfo, ['DisruptionInfoStore'], (context) =>
  ({
    open: context.getStore('DisruptionInfoStore').isOpen,
  })
);
