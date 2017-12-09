import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
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
    fragment FavouriteLocationContainer_plan on QueryType {
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
        preferred: $preferred
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
