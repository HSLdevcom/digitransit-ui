/**
 * Sorts favourite bike rental stations first if they are within 1500m
 *
 * @param {Set} favouriteRentalStationsIds stationIds of favourite bike rental stations.
 */
export const sortNearbyRentalStations = favouriteRentalStationsIds => {
  return (first, second) => {
    const firstIsClose = first.node.distance < 1500;
    const secondIsClose = second.node.distance < 1500;
    const firstIsFavourite =
      favouriteRentalStationsIds.has(first.node.place.stationId) &&
      firstIsClose;
    const secondIsFavourite =
      favouriteRentalStationsIds.has(second.node.place.stationId) &&
      secondIsClose;
    if (firstIsFavourite === secondIsFavourite) {
      return 0;
    }
    if (firstIsFavourite) {
      return -1;
    }
    return 1;
  };
};

/**
 * Sorts favourite stops or stations first. Prioritizes stations if they are within
 * a given distance
 *
 * @param {Set} favouriteStopIds gtfsIds of favourite stops and stations.
 * @param distanceThreshold maximum distance with which the stops are priorized
 */
export const sortNearbyStops = (favouriteStopIds, distanceThreshold) => {
  return (first, second) => {
    const firstStopOrStationId = first.node.place.parentStation
      ? first.node.place.parentStation.gtfsId
      : first.node.place.gtfsId;
    const firstStopOrStationIsClose = first.node.distance < distanceThreshold;
    const secondStopOrStationId = second.node.place.parentStation
      ? second.node.place.parentStation.gtfsId
      : second.node.place.gtfsId;
    const secondStopOrStationIsClose = second.node.distance < distanceThreshold;
    const firstIsFavourite =
      favouriteStopIds.has(firstStopOrStationId) && firstStopOrStationIsClose;
    const secondIsFavourite =
      favouriteStopIds.has(secondStopOrStationId) && secondStopOrStationIsClose;
    if (firstIsFavourite === secondIsFavourite) {
      return 0;
    }
    if (firstIsFavourite) {
      return -1;
    }
    return 1;
  };
};
