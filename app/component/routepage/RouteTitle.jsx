import React from 'react';
import PropTypes from 'prop-types';
import { useFragment } from 'react-relay';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { routePagePath } from '../../../utils/shared/path';
import { useBreakpoint } from '../../hooks/BreakpointContext';

import RouteNumberContainer from '../RouteNumberContainer';
import RouteTitleFragment from './queries/RouteTitleFragment';

function RouteTitle({ route: routeRef = null }) {
  const breakpoint = useBreakpoint();
  const route = useFragment(RouteTitleFragment, routeRef);
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
}

RouteTitle.propTypes = {
  route: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

export default RouteTitle;
