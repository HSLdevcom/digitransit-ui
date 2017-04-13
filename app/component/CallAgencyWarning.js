import React from 'react';

import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';

const CallAgencyWarning = () => (
  <div className="warning-message padding-normal">
    <Icon className="warning-message-icon" img="icon-icon_call" />
    <FormattedMessage id="warning-call-agency-no-route" defaultMessage="Only on demand. Needs to be booked in advance." />
  </div>);


CallAgencyWarning.description = () => (
  <div>
    <p>Displays a warning message.</p>
    <ComponentUsageExample description="normal">
      <CallAgencyWarning />
    </ComponentUsageExample>
  </div>
  );

CallAgencyWarning.contextTypes = {
  config: React.PropTypes.object.isRequired,
};

export default CallAgencyWarning;
