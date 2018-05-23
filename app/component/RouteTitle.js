import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { PREFIX_ROUTES } from '../util/path';
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
  route: PropTypes.shape({
    gtfsId: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    shortName: PropTypes.string,
    color: PropTypes.string,
  }),
  breakpoint: PropTypes.string,
};

export default Relay.createContainer(withBreakpoint(RouteTitle), {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        gtfsId
        shortName
        color
        mode
        type
      }
    `,
  },
});
