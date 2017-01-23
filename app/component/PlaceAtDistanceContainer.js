import React from 'react';
import Relay from 'react-relay';

import DepartureRowContainer from './DepartureRowContainer';
import BicycleRentalStationRowContainer from './BicycleRentalStationRowContainer';

const placeAtDistanceFragment = variables => Relay.QL`
  fragment on placeAtDistance {
    distance
    place {
      id
      __typename
      ${DepartureRowContainer.getFragment('departure', {
        currentTime: variables.currentTime,
        timeRange: variables.timeRange,
      })}
      ${BicycleRentalStationRowContainer.getFragment('station', {
        currentTime: variables.currentTime,
      })}
    }
  }
`;

/* eslint-disable no-underscore-dangle */
const PlaceAtDistance = (props) => {
  let place;
  if (props.placeAtDistance.place.__typename === 'DepartureRow') {
    place = (
      <DepartureRowContainer
        distance={props.placeAtDistance.distance}
        departure={props.placeAtDistance.place}
        currentTime={props.currentTime}
        timeRange={props.timeRange}
      />
    );
  } else if (props.placeAtDistance.place.__typename === 'BikeRentalStation') {
    place = (
      <BicycleRentalStationRowContainer
        distance={props.placeAtDistance.distance}
        station={props.placeAtDistance.place}
        currentTime={props.currentTime}
      />
    );
  }
  return place;
};
/* eslint-enable no-underscore-dangle */

PlaceAtDistance.propTypes = {
  placeAtDistance: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
  timeRange: React.PropTypes.number.isRequired,
};

export default Relay.createContainer(PlaceAtDistance, {
  fragments: {
    placeAtDistance: placeAtDistanceFragment,
  },

  initialVariables: {
    currentTime: 0,
    timeRange: 0,
  },
});
