import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';
import RoutePage from './RoutePage';
import TripStopListContainer from '../component/trip/TripStopListContainer';

const TripPage = (props) => {
  const tripStartTime = props.trip.stoptimesForDate[0].serviceDay +
    props.trip.stoptimesForDate[0].scheduledDeparture;
  const tripStartHHmm = moment(tripStartTime * 1000).format('HHmm');
  return (<RoutePage {...props} pattern={props.trip.pattern} tripStart={tripStartHHmm} />);
};

TripPage.propTypes = {
  trip: React.PropTypes.shape({
    pattern: React.PropTypes.object.isRequired,
    stoptimesForDate: React.PropTypes.array,
  }).isRequired,
};

export default Relay.createContainer(TripPage, {
  fragments: {
    trip: () => Relay.QL`
      fragment on Trip {
        stoptimesForDate {
          scheduledDeparture
          serviceDay
        }

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
