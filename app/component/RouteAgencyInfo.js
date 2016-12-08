import React from 'react';
import Relay from 'react-relay';
import get from 'lodash/get';
import { FormattedMessage, intlShape } from 'react-intl';
import config from '../config';

function RouteAgencyInfo({ route }) {
  const agencyName = get(route, 'agency.name');
  const show = get(config, 'agency.show', false);
  if (show && agencyName) {
    return (<span className="route-agency-name">
      <FormattedMessage id="agency" defaultMessage="Agency" />: {agencyName}
    </span>);
  }
  return null;
}

RouteAgencyInfo.contextTypes = {
  intl: intlShape.isRequired,
};

RouteAgencyInfo.propTypes = {
  route: React.PropTypes.object,
};

export default Relay.createContainer(RouteAgencyInfo, {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        agency {
          name
        }
      }
    `,
  },
});
