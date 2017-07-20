import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';

import DepartureRowContainer from './DepartureRowContainer';
import BicycleRentalStationRowContainer from './BicycleRentalStationRowContainer';

/* eslint-disable no-underscore-dangle */
const PlaceAtDistance = props => {
  let place;
  if (props.placeAtDistance.place.__typename === 'DepartureRow') {
    place = (
      <DepartureRowContainer
        distance={props.placeAtDistance.distance}
        departure={props.placeAtDistance.place}
        currentTime={props.currentTime}
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
  placeAtDistance: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default createFragmentContainer(PlaceAtDistance, {
  placeAtDistance: graphql.experimental`
    fragment PlaceAtDistanceContainer_placeAtDistance on placeAtDistance
      @argumentDefinitions(
        currentTime: { type: "Long" }
        timeRange: { type: "Int" }
      ) {
      distance
      place {
        id
        __typename
        ...DepartureRowContainer_departure
          @arguments(currentTime: $currentTime, timeRange: $timeRange)
        ...BicycleRentalStationRowContainer_station
      }
    }
  `,
});
