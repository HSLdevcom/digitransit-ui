import PropTypes from 'prop-types';
import React from 'react';
import get from 'lodash/get';

import { FormattedMessage } from 'react-intl';
import Icon from './Icon';

const CallAgencyWarning = ({ route }) => (
  <div className="route-warning-message padding-normal">
    <div className="upper">
      <Icon className="warning-message-icon" img="icon-icon_call" />
      <FormattedMessage
        id="warning-call-agency-no-route"
        defaultMessage="Only on demand. Needs to be booked in advance."
      />
    </div>
    {get(route, 'agency.phone', false) ? (
      <div className="call-button">
        <a href={`tel:${route.agency.phone}`}>
          <FormattedMessage id="call" defaultMessage="Call" />{' '}
          {route.agency.phone}
        </a>
      </div>
    ) : (
      ''
    )}
  </div>
);

CallAgencyWarning.propTypes = {
  route: PropTypes.object.isRequired,
};
CallAgencyWarning.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CallAgencyWarning;
