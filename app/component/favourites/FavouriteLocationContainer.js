import React, { PropTypes } from 'react';
import { createContainer } from 'react-relay';
import head from 'lodash/head';
import find from 'lodash/find';
import { FavouriteLocationContainerFragments } from '../../queries';
import FavouriteLocation from './FavouriteLocation';
import config from '../../config';


const FavouriteLocationContainer = ({ currentTime, onClickFavourite, plan, favourite }) => {
  const itinerary = (plan && plan.plan.itineraries[0]) || {};
  const firstTransitLeg = head(find(itinerary.legs, leg => leg.transitLeg));

  return (<FavouriteLocation
    locationName={favourite.locationName}
    favouriteLocationIconId={favourite.selectedIconId}
    lat={favourite.lat} lon={favourite.lon}
    clickFavourite={onClickFavourite}
    departureTime={itinerary.startTime / 1000} arrivalTime={itinerary.endTime / 1000}
    currentTime={currentTime} firstTransitLeg={firstTransitLeg}
  />);
};

FavouriteLocationContainer.propTypes = {
  plan: PropTypes.object.isRequired,
  favourite: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  onClickFavourite: PropTypes.func.isRequired,
};

export default createContainer(FavouriteLocationContainer, {
  fragments: FavouriteLocationContainerFragments,

  initialVariables: {
    from: null,
    to: null,
    numItineraries: 1,
    walkReluctance: 2.0001,
    walkBoardCost: 600,
    minTransferTime: 180,
    walkSpeed: 1.2,
    wheelchair: false,
    maxWalkDistance: config.maxWalkDistance + 0.1,

    preferred: {
      agencies: config.preferredAgency || '',
    },

    arriveBy: false,
    disableRemainingWeightHeuristic: false,
  },
});
