export const getCo2Value = itinerary => {
  return typeof itinerary.emissionsPerPerson?.co2 === 'number' &&
    itinerary.emissionsPerPerson?.co2 >= 0
    ? Math.round(itinerary.emissionsPerPerson?.co2)
    : null;
};

export const hasItinerariesContainingPublicTransit = plan => {
  if (plan?.itineraries?.length) {
    if (plan.itineraries.length === 1) {
      // check that only itinerary contains public transit
      return (
        plan.itineraries[0].legs.filter(
          obj =>
            obj.mode !== 'WALK' &&
            obj.mode !== 'BICYCLE' &&
            obj.mode !== 'CAR' &&
            obj.mode !== 'SCOOTER',
        ).length > 0
      );
    }
    return true;
  }
  return false;
};

/**
 * Gets the minimum duration of any itinerary in a plan.
 *
 * @param {*} plan a plan containing itineraries
 */
export const getDuration = plan => {
  if (!plan) {
    return null;
  }
  const min = Math.min(...plan.itineraries.map(itin => itin.duration));
  return min;
};

/**
 * Filters away legs that only use walking and/or cycling
 *
 * @param {*} plan a plan containing itineraries
 */
export const getBikeAndPublic = plan => {
  if (Array.isArray(plan?.itineraries)) {
    return {
      itineraries: plan.itineraries.filter(
        itinerary =>
          !itinerary.legs.every(
            leg => leg.mode === 'WALK' || leg.mode === 'BICYCLE',
          ),
      ),
    };
  }
  return { itineraries: undefined };
};

export default getCo2Value;
