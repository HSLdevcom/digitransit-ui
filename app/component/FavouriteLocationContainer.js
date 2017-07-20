import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import find from 'lodash/find';
import FavouriteLocation from './FavouriteLocation';

const FavouriteLocationContainer = ({
  currentTime,
  onClickFavourite,
  viewer: { plan },
  favourite,
}) => {
  const itinerary = (plan && plan.itineraries[0]) || {};
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
  viewer: PropTypes.shape({
    plan: PropTypes.object.isRequired,
  }).isRequired,
  favourite: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  onClickFavourite: PropTypes.func.isRequired,
};

export default createFragmentContainer(FavouriteLocationContainer, {
  viewer: graphql.experimental`
    fragment FavouriteLocationContainer_viewer on QueryType
      @argumentDefinitions(
        # TODO: get these from stored default parameters
        from: { type: "InputCoordinates!" }
        to: { type: "InputCoordinates!" }
        maxWalkDistance: { type: "Float" }
        wheelchair: { type: "Boolean" }
        preferred: { type: "InputPreferred" }
        arriveBy: { type: "Boolean!", defaultValue: false }
      ) {
      plan(
        from: $from
        to: $to
        maxWalkDistance: $maxWalkDistance
        wheelchair: $wheelchair
        preferred: $preferred
        arriveBy: $arriveBy
        numItineraries: 1
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
