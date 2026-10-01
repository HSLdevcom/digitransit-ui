import React from 'react';
import { graphql, useFragment } from 'react-relay';
import get from 'lodash/get';
import { routeShape } from '../../../utils/client/shapes';
import AgencyInfo from '../AgencyInfo';
import { useConfigContext } from '../../client/ConfigContext';

function RouteAgencyInfo({ route: routeRef }) {
  const config = useConfigContext();
  const route = useFragment(
    graphql`
      fragment RouteAgencyInfo_route on Route {
        agency {
          name
          url
          fareUrl
        }
      }
    `,
    routeRef,
  );
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

RouteAgencyInfo.propTypes = {
  route: routeShape.isRequired,
};

export default RouteAgencyInfo;
