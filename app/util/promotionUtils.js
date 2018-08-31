import Relay from 'react-relay/classic';
import moment from 'moment';

import {
  preparePlanParams,
  defaultRoutingSettings,
  getQuery,
} from '../util/planParamUtil';

export const defaultParams = (currentTime, config, context) => {
  const params = preparePlanParams(config)(context.router.params, context);
  const startingParams = {
    wheelchair: null,
    ...defaultRoutingSettings,
    ...params,
    numItineraries: 1,
    arriveBy: context.router.params.arriveBy || false,
    date: moment(currentTime).format('YYYY-MM-DD'),
    time: moment(currentTime).format('HH:mm'),
  };
  return startingParams;
};
/**
 * Creates a query for Promotion suggestions
 * @param currentTime The current time for the itineraries
 * @param config The current config
 * @param context The current context
 * @param mode The promotion mode
 */

export const getPromotionQuery = (currentTime, config, context, mode) => {
  const startingParams = defaultParams(currentTime, config, context);

  const promotionParams = {
    ...startingParams,
    modes: mode,
  };

  return Relay.createQuery(getQuery(), promotionParams);
};

/**
 * Check the terms for the suggestions
 * @param plan The plan to check
 * @param maxDuration The maximum duration
 * @param maxDistance The maximum distance
 */
export const checkResults = (plan, maxDuration, maxDistance) =>
  plan.duration <= maxDuration && plan.legs[0].distance <= maxDistance
    ? plan
    : null;

/**
 * Call the query for the Biking&Walking suggestions for public transport
 * @param currentTime The current plan time
 * @param config The current config
 * @param context The current context
 * @param modes The promoted modes to search for, takes an array of 2 items
 * @param setPromotionSuggestions the function to set the state
 * @param maxDurationBike The maximum duration allowed for a bike itinerary
 * @param maxDistanceBike The maximum distance allowed for a bike itinerary
 * @param maxDurationWalk The maximum duration allowed for a walking itinerary
 * @param maxDistanceWalk The maximum distance allowed for a walking itinerary
 */

export const getBikeWalkPromotions = (
  currentTime,
  config,
  context,
  modes,
  setPromotionSuggestions,
  maxDurationBike,
  maxDistanceBike,
  maxDurationWalk,
  maxDistanceWalk,
) => {
  const bikingQuery = getPromotionQuery(currentTime, config, context, modes[0]);
  const walkingQuery = getPromotionQuery(
    currentTime,
    config,
    context,
    modes[1],
  );

  Relay.Store.primeCache({ bikingQuery }, bikeQueryStatus => {
    if (bikeQueryStatus.ready === true) {
      const bikingPlan = Relay.Store.readQuery(bikingQuery)[0].plan
        .itineraries[0];

      Relay.Store.primeCache({ walkingQuery }, walkingQueryStatus => {
        if (walkingQueryStatus.ready === true) {
          const walkingPlan = Relay.Store.readQuery(walkingQuery)[0].plan
            .itineraries[0];

          setPromotionSuggestions(
            [
              checkResults(bikingPlan, maxDurationBike, maxDistanceBike) && {
                plan: bikingPlan,
                textId: 'bicycle',
                iconName: 'biking',
                mode: 'BICYCLE',
              },
              checkResults(walkingPlan, maxDurationWalk, maxDistanceWalk) && {
                plan: walkingPlan,
                textId: 'by-walking',
                iconName: 'walk',
                mode: 'WALK',
              },
            ].filter(o => o),
          );
        }
      });
    }
  });
};
