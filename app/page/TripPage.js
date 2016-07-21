import React from 'react';
import Relay from 'react-relay';
import RoutePage from './RoutePage';
import TripStopListContainer from '../component/trip/TripStopListContainer';

const TripPage = (props) => <RoutePage {...props} pattern={props.trip.pattern} />;

TripPage.propTypes = {
  trip: React.PropTypes.shape({
    pattern: React.PropTypes.object.isRequired,
  }).isRequired,
};

export default Relay.createContainer(TripPage, {
  fragments: {
    trip: () => Relay.QL`
      fragment on Trip {
        pattern {
          ${RoutePage.getFragment('pattern')}
        }
        stoptimes {
          scheduledDeparture
        }
        ${TripStopListContainer.getFragment('trip')}
      }
    `,
  },
});
