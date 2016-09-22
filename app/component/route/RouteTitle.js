import React from 'react';
import Relay from 'react-relay';
import Link from 'react-router/lib/Link';

import RouteNumber from '../departure/RouteNumber';

const RouteTitle = ({ route }) => (
  <Link to={`/linjat/${route.gtfsId}`}>
    <RouteNumber
      mode={route.mode}
      text={route.shortName}
    />
  </Link>
);

RouteTitle.propTypes = {
  route: React.PropTypes.shape({
    gtfsId: React.PropTypes.string.isRequired,
    mode: React.PropTypes.string.isRequired,
    shortName: React.PropTypes.string,
  }).isRequired,
};

export default Relay.createContainer(RouteTitle, {
  fragments: {
    route: () =>
      Relay.QL`
      fragment on Route {
        gtfsId
        shortName
        mode
      }
    `,
  },
});
