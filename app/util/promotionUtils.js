import Relay from 'react-relay/classic';
import moment from 'moment';

import {
  preparePlanParams,
  defaultRoutingSettings,
  getQuery,
} from '../util/planParamUtil';

import { getStreetMode, getDefaultOTPModes } from '../util/modeUtils';

export const defaultParams = (currentTime, config, context) => {
  const params = preparePlanParams(config)(
    context.router.params,
    context.router,
  );
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

  console.log(bikingQuery);

  Relay.Store.primeCache({ bikingQuery }, bikeQueryStatus => {
    if (bikeQueryStatus.ready === true) {
      const bikingPlan = Relay.Store.readQuery(bikingQuery)[0].plan
        .itineraries[0];
      console.log(bikingPlan);

      Relay.Store.primeCache({ walkingQuery }, walkingQueryStatus => {
        if (walkingQueryStatus.ready === true) {
          console.log(Relay.Store.readQuery(walkingQuery));
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

/**
 * @param itineraries The current itineraries
 * @param context The current context
 * @param config The current config
 * @param currentTime The current time
 * @param setPromotionSuggestions The function to set promotion state
 */

export const checkPromotionQueries = (
  itineraries,
  context,
  config,
  currentTime,
  setPromotionSuggestions,
) => {
  if (itineraries && itineraries.length > 0) {
    const totalTransitDistance = itineraries[0].legs
      .map(leg => leg.distance)
      .reduce((a, b) => a + b, 0);
    if (
      getStreetMode(context.location, context.config) === 'PUBLIC_TRANSPORT' &&
      Math.round(totalTransitDistance / 500) * 500 <= 5000
    ) {
      getBikeWalkPromotions(
        currentTime,
        config,
        context,
        ['BICYCLE', 'WALK'],
        setPromotionSuggestions,
        1800,
        5000,
        1800,
        2000,
      );
    }
    if (getStreetMode(context.location, context.config) === 'CAR_PARK') {
      getBikeWalkPromotions(
        currentTime,
        config,
        context,
        ['BICYCLE,RAIL,SUBWAY,FERRY', getDefaultOTPModes(config).toString()],
        setPromotionSuggestions,
        900,
        2500,
        900,
        1000,
      );
    }
  }
};
