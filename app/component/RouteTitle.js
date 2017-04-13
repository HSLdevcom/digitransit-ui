import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import RouteNumberContainer from './RouteNumberContainer';

const RouteTitle = ({ route }, { breakpoint }) => (
  (breakpoint === 'large' || !route || !route.mode) ?
    <FormattedMessage
      id="route-page.title-short"
      defaultMessage="Route"
    />
    :
    <Link to={`/linjat/${route.gtfsId}`}>
      <RouteNumberContainer
        className="route-number-title"
        route={route}
        vertical={false}
        text={route.shortName}
      />
    </Link>
);

RouteTitle.propTypes = {
  route: React.PropTypes.shape({
    gtfsId: React.PropTypes.string.isRequired,
    mode: React.PropTypes.string.isRequired,
    shortName: React.PropTypes.string,
  }),
};

RouteTitle.contextTypes = {
  breakpoint: React.PropTypes.string,
};

export default Relay.createContainer(RouteTitle, {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        gtfsId
        shortName
        mode
        type
      }
    `,
  },
});
