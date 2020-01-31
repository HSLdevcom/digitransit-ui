import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import find from 'lodash/find';
import FavouriteLocation from './FavouriteLocation';

const FavouriteLocationContainer = ({
  currentTime,
  onClickFavourite,
  plan,
  favourite,
}) => {
  const itinerary = (plan && plan.plan.itineraries[0]) || {};
  const firstTransitLeg = find(itinerary.legs, leg => leg.transitLeg);

  let departureTime;
  // We might not have any transit legs, just walking
  if (firstTransitLeg) {
    departureTime = firstTransitLeg.startTime / 1000;
  }

  return (
    <FavouriteLocation
      favourite={favourite}
      clickFavourite={onClickFavourite}
      departureTime={departureTime}
      currentTime={currentTime}
      firstTransitLeg={firstTransitLeg}
    />
  );
};

FavouriteLocationContainer.propTypes = {
  plan: PropTypes.object.isRequired,
  favourite: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  onClickFavourite: PropTypes.func.isRequired,
};

export default createFragmentContainer(FavouriteLocationContainer, {
  plan: graphql`
    fragment FavouriteLocationContainer_plan on QueryType
      @argumentDefinitions(
        from: { type: "InputCoordinates" }
        to: { type: "InputCoordinates" }
        numItineraries: { type: "Int", defaultValue: 1 }
        walkReluctance: { type: "Float", defaultValue: 2.0001 }
        walkBoardCost: { type: "Int", defaultValue: 600 }
        minTransferTime: { type: "Int", defaultValue: 120 }
        walkSpeed: { type: "Float", defaultValue: 1.2 }
        wheelchair: { type: "Boolean", defaultValue: false }
        maxWalkDistance: { type: "Float", defaultValue: 0 }
        arriveBy: { type: "Boolean", defaultValue: false }
        disableRemainingWeightHeuristic: {
          type: "Boolean"
          defaultValue: false
        }
      ) {
      plan(
        from: $from
        to: $to
        numItineraries: $numItineraries
        walkReluctance: $walkReluctance
        walkBoardCost: $walkBoardCost
        minTransferTime: $minTransferTime
        walkSpeed: $walkSpeed
        maxWalkDistance: $maxWalkDistance
        wheelchair: $wheelchair
        disableRemainingWeightHeuristic: $disableRemainingWeightHeuristic
        arriveBy: $arriveBy
      ) {
        itineraries {
          startTime
          endTime
          legs {
            realTime
            transitLeg
            mode
            startTime
            route {
              shortName
            }
          }
        }
      }
    }
  `,
});
