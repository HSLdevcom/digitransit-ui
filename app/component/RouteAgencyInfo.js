import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import get from 'lodash/get';
import { routeShape, configShape } from '../util/shapes';
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
  config: configShape.isRequired,
};

RouteAgencyInfo.propTypes = {
  route: routeShape.isRequired,
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
