import React from 'react';
import Relay from 'react-relay';
import get from 'lodash/get';
import AgencyInfo from './AgencyInfo';

function RouteAgencyInfo({ route }, { config }) {
  const agencyName = get(route, 'agency.name');
  const url = get(route, 'agency.fareUrl') || get(route, 'agency.url');
  const show = get(config, 'agency.show', false);


  if (show) {
    return <div className="route-agency"><AgencyInfo url={url} agencyName={agencyName} /></div>;
  } return null;
}

RouteAgencyInfo.contextTypes = {
  config: React.PropTypes.object.isRequired,
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
          url
          fareUrl
        }
      }
    `,
  },
});
