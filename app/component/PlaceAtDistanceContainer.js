import PropTypes from 'prop-types';
import React from 'react';
import { gql } from 'react-apollo';

import DepartureRowContainer, { departureRowContainerFragment } from './DepartureRowContainer';
import BicycleRentalStationRowContainer, { bicycleRentalRowContainerFragment } from './BicycleRentalStationRowContainer';

export const placeAtDistanceFragment = gql`
  fragment placeAtDistanceFragment on placeAtDistance {
    distance
    place {
      id
      __typename
      ...departureRowContainerFragment
      ...bicycleRentalRowContainerFragment
    }
  }
  ${departureRowContainerFragment}
  ${bicycleRentalRowContainerFragment}
`;

/* eslint-disable no-underscore-dangle */
export default function PlaceAtDistance(props) {
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
}
/* eslint-enable no-underscore-dangle */

PlaceAtDistance.propTypes = {
  placeAtDistance: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  timeRange: PropTypes.number.isRequired,
};
