export const getCo2Value = itinerary => {
  return typeof itinerary.emissionsPerPerson?.co2 === 'number' &&
    itinerary.emissionsPerPerson?.co2 >= 0
    ? Math.round(itinerary.emissionsPerPerson?.co2)
    : null;
};

export const getDuration = plan => {
  if (!plan) {
    return null;
  }
  const min = Math.min(...plan.itineraries.map(itin => itin.duration));
  return min;
};

export const hasItinerariesContainingPublicTransit = plan => {
  if (plan && Array.isArray(plan.itineraries) && plan.itineraries.length > 0) {
    // TODO why only check the first? why does the function's name imply sth else?
    if (plan.itineraries.length === 1) {
      // check that only itinerary contains public transit
      return (
        plan.itineraries[0].legs.filter(
          obj =>
            obj.mode !== 'WALK' && obj.mode !== 'BICYCLE' && obj.mode !== 'CAR',
        ).length > 0
      );
    }
    return true;
  }
  return false;
};

export const filteredHasRentalVehicleLeg = (plan, mode) => {
  return {
    itineraries: (plan?.itineraries || []).filter(it =>
      it.legs.some(leg => leg.mode === mode && leg.rentedBike === true),
    ),
  };
};
