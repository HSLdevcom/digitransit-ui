import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';

const RouteDetails = props => <div>{console.log(props.route)}</div>;

RouteDetails.propTypes = {
  route: PropTypes.shape({
    shortName: PropTypes.string,
    longName: PropTypes.string,
    patterns: PropTypes.shape({
      headsign: PropTypes.string,
    }),
  }).isRequired,
};

export default Relay.createContainer(RouteDetails, {
  fragments: {
    route: () => Relay.QL`
        fragment on Route {
                shortName
                longName
                patterns {
                    headsign
                }
            }
      `,
  },
});
