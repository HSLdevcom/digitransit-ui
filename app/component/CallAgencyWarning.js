import React from 'react';
import { Link } from 'react-router';
import get from 'lodash/get';

import { FormattedMessage } from 'react-intl';
import ComponentUsageExample from './ComponentUsageExample';
import Icon from './Icon';


const CallAgencyWarning = ({ route }) => (
  <div className="route-warning-message padding-normal"><div className="upper">
    <Icon className="warning-message-icon" img="icon-icon_call" />
    <FormattedMessage id="warning-call-agency-no-route" defaultMessage="Only on demand. Needs to be booked in advance." /></div>
    {get(route, 'agency.phone', false) ? (
      <div className="call-button">
        <Link href={`tel:${route.agency.phone}`}>
          <FormattedMessage id="call" defaultMessage="Call" />
          {route.agency.phone}
        </Link>
      </div>) : ''}
  </div>
);


CallAgencyWarning.description = () => (
  <div>
    <p>Displays a warning message.</p>
    <ComponentUsageExample description="normal">
      <CallAgencyWarning />
    </ComponentUsageExample>
  </div>
  );

CallAgencyWarning.propTypes = {
  route: React.PropTypes.object.isRequired,
};
CallAgencyWarning.contextTypes = {
  config: React.PropTypes.object.isRequired,
};

export default CallAgencyWarning;
