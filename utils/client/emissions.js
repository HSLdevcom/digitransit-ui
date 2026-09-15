export default function getCo2Value(itinerary) {
  return typeof itinerary.emissionsPerPerson?.co2 === 'number' &&
    itinerary.emissionsPerPerson?.co2 >= 0
    ? Math.round(itinerary.emissionsPerPerson?.co2)
    : null;
}
