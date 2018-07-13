import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';

const RouteDetails = props => <div>{console.log(props)}</div>;

RouteDetails.propTypes = {
  relay: PropTypes.shape({
    route: PropTypes.shape({
      params: PropTypes.shape({
        to: PropTypes.shape({
          lat: PropTypes.number,
          lon: PropTypes.number,
          address: PropTypes.string.isRequired,
        }).isRequired,
        from: PropTypes.shape({
          lat: PropTypes.number,
          lon: PropTypes.number,
          address: PropTypes.string.isRequired,
        }).isRequired,
        intermediatePlaces: PropTypes.array,
      }).isRequired,
    }).isRequired,
  }).isRequired,
};

export default Relay.createContainer(RouteDetails, {
  fragments: {
    route: () => Relay.QL`
        fragment on Route {
                shortName
                longName
            }
      `,
  },
  initialVariables: { gtfsId: null },
});
