export const getCo2Value = itinerary => {
  return typeof itinerary.emissionsPerPerson?.co2 === 'number' &&
    itinerary.emissionsPerPerson?.co2 >= 0
    ? Math.round(itinerary.emissionsPerPerson?.co2)
    : null;
};

export default getCo2Value;
