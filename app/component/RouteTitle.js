import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Link from 'found/Link';
import { FormattedMessage } from 'react-intl';
import { PREFIX_ROUTES } from '../util/path';
import { RouteShape } from '../util/shapes';
import withBreakpoint from '../util/withBreakpoint';

import RouteNumberContainer from './RouteNumberContainer';

const RouteTitle = ({ route, breakpoint }) =>
  breakpoint === 'large' || !route || !route.mode ? (
    <FormattedMessage id="route-page.title-short" defaultMessage="Route" />
  ) : (
    <Link to={`/${PREFIX_ROUTES}/${route.gtfsId}`}>
      <RouteNumberContainer
        className="route-number-title"
        color={route.color}
        route={route}
        vertical={false}
        text={route.shortName}
      />
    </Link>
  );

RouteTitle.propTypes = {
  route: RouteShape.isRequired,
  breakpoint: PropTypes.string,
};

RouteTitle.defaultProps = {
  breakpoint: undefined,
};

export default createFragmentContainer(withBreakpoint(RouteTitle), {
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
