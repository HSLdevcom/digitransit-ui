import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { routePagePath } from '../../../utils/shared/path';
import { routeShape } from '../../../utils/client/shapes';
import { useBreakpoint } from '../../hooks/BreakpointContext';

import RouteNumberContainer from '../RouteNumberContainer';

const RouteTitle = ({ route }) => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'large' || !route || !route.mode ? (
    <FormattedMessage id="route-page.title-short" defaultMessage="Route" />
  ) : (
    <Link to={routePagePath(route.gtfsId)}>
      <RouteNumberContainer
        className="route-number-title"
        color={route.color}
        route={route}
        vertical={false}
        text={route.shortName}
      />
    </Link>
  );
};

RouteTitle.propTypes = {
  route: routeShape.isRequired,
};

export default createFragmentContainer(RouteTitle, {
  route: graphql`
    fragment RouteTitle_route on Route {
      gtfsId
      shortName
      color
      mode
      type
    }
  `,
});
