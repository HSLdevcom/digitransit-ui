import React from 'react';
import { FormattedMessage } from 'react-intl';
import connectToStores from 'fluxible-addons-react/connectToStores';

import Modal from './Modal';
import { close as closeAction } from '../action/notImplementedActions';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

function NotImplemented({ name }, { executeAction }) {
  const close = () => executeAction(closeAction);

  return (
    <Modal allowClicks open={!!name} title="" toggleVisibility={close}>
      <div className="row">
        <div className="small-4 columns">
          <Icon className="not-implemented-icon" img="icon-icon_under-construction" />
        </div>
        <div className="small-8 columns">
          <h2 className="no-padding no-margin not-implemented-color">
            <FormattedMessage
              id="not-implemented"
              values={{ name }}
              defaultMessage="{name} - feature is not implemented"
            />
          </h2>
        </div>
      </div>
      <div className="row">
        <div className="small-12 columns not-implemented">
          <p>
            <FormattedMessage
              id="not-implemented-msg"
              // eslint-disable-next-line max-len
              defaultMessage="If you want to participate in the development of this service/feature please see more information from the below links."
            />
          </p>
          <a
            className="primary-color"
            href="https://github.com/HSLdevcom/digitransit-ui"
          >GitHub ›</a><br />
          <a className="primary-color" href="https://projects.invisionapp.com/share/MY2F0CQ2W#/screens">InVision ›</a><br />
          <a className="primary-color" href="https://digitransit.atlassian.net/secure/Dashboard.jspa">Jira ›</a><br />
        </div>
      </div>
    </Modal>
  );
}

NotImplemented.description = (
  <div>
    <p>
      Placeholder for a &lsquo;not implemented&rsquo; popup.
      It is activated from clicking of NotImplementedLink
    </p>
    <ComponentUsageExample><NotImplemented /></ComponentUsageExample>
  </div>
);

NotImplemented.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
};

NotImplemented.propTypes = {
  name: React.PropTypes.string,
};

export default connectToStores(NotImplemented, ['NotImplementedStore'], context =>
  ({ name: context.getStore('NotImplementedStore').getName() }),
);
