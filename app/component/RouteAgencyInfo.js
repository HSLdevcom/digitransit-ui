import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import get from 'lodash/get';
import AgencyInfo from './AgencyInfo';

function RouteAgencyInfo({ route }, { config }) {
  const agencyName = get(route, 'agency.name');
  const url = get(route, 'agency.fareUrl') || get(route, 'agency.url');
  const show = get(config, 'agency.show', false);

  if (show) {
    return (
      <div className="route-agency">
        <AgencyInfo url={url} agencyName={agencyName} />
      </div>
    );
  }
  return null;
}

RouteAgencyInfo.contextTypes = {
  config: PropTypes.object.isRequired,
};

RouteAgencyInfo.propTypes = {
  route: PropTypes.object,
};

export default createFragmentContainer(RouteAgencyInfo, {
  route: graphql`
    fragment RouteAgencyInfo_route on Route {
      agency {
        name
        url
        fareUrl
      }
    }
  `,
});
