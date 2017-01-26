import React, { PropTypes } from 'react';
import Relay from 'react-relay';
import find from 'lodash/find';
import FavouriteLocation from './FavouriteLocation';


const FavouriteLocationContainer = ({ currentTime, onClickFavourite, plan, favourite }) => {
  const itinerary = (plan && plan.plan.itineraries[0]) || {};
  const firstTransitLeg = find(itinerary.legs, leg => (leg.transitLeg));

  let departureTime;
  // We might not have any transit legs, just walking
  if (firstTransitLeg) {
    departureTime = firstTransitLeg.startTime / 1000;
  }

  return (<FavouriteLocation
    favourite={favourite}
    clickFavourite={onClickFavourite}
    {...{
      departureTime,
      currentTime,
      firstTransitLeg,
    }}
  />);
};

FavouriteLocationContainer.propTypes = {
  plan: PropTypes.object.isRequired,
  favourite: PropTypes.object.isRequired,
  currentTime: PropTypes.number.isRequired,
  onClickFavourite: PropTypes.func.isRequired,
};

export default Relay.createContainer(FavouriteLocationContainer, {
  fragments: {
    plan: () => Relay.QL`
      fragment on QueryType {
        plan(
          from: $from,
          to: $to,
          numItineraries: $numItineraries,
          walkReluctance: $walkReluctance,
          walkBoardCost: $walkBoardCost,
          minTransferTime: $minTransferTime,
          walkSpeed: $walkSpeed,
          maxWalkDistance:
          $maxWalkDistance,
          wheelchair: $wheelchair,
          disableRemainingWeightHeuristic:
          $disableRemainingWeightHeuristic,
          arriveBy: $arriveBy,
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
  },
  initialVariables: {
    from: null,
    to: null,
    numItineraries: 1,
    walkReluctance: 2.0001,
    walkBoardCost: 600,
    minTransferTime: 180,
    walkSpeed: 1.2,
    wheelchair: false,
    maxWalkDistance: 0,

    preferred: {
      agencies: '',
    },

    arriveBy: false,
    disableRemainingWeightHeuristic: false,
  },
});
