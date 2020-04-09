import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import RouteLine from './route/RouteLine';

const TripLine = props => <RouteLine thin {...props} />;

TripLine.propTypes = {
  pattern: PropTypes.object.isRequired,
  filteredStops: PropTypes.array,
};

TripLine.defaultProps = {
  filteredStops: [],
};

export default Relay.createContainer(TripLine, {
  fragments: {
    pattern: () => Relay.QL`
    fragment on Trip {
      pattern {
        ${RouteLine.getFragment('pattern')}
      }
    }
  `,
  },
});
