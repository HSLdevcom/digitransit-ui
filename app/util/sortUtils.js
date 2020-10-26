/**
 * Sorts favourite bike rental stations first
 *
 * @param {Set} favouriteRentalStationsIds stationIds of favourite bike rental stations.
 */
export const sortNearbyRentalStations = favouriteRentalStationsIds => {
  return (first, second) => {
    const firstIsFavourite = favouriteRentalStationsIds.has(
      first.node.place.stationId,
    );
    const secondIsFavourite = favouriteRentalStationsIds.has(
      second.node.place.stationId,
    );
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
 * Sorts favourite stops or stations first
 *
 * @param {Set} favouriteStopIds gtfsIds of favourite stops and stations.
 */
export const sortNearbyStops = favouriteStopIds => {
  return (first, second) => {
    const firstStopOrStationId = first.node.place.parentStation
      ? first.node.place.parentStation.gtfsId
      : first.node.place.gtfsId;
    const secondStopOrStationId = second.node.place.parentStation
      ? second.node.place.parentStation.gtfsId
      : second.node.place.gtfsId;
    const firstIsFavourite = favouriteStopIds.has(firstStopOrStationId);
    const secondIsFavourite = favouriteStopIds.has(secondStopOrStationId);
    if (firstIsFavourite === secondIsFavourite) {
      return 0;
    }
    if (firstIsFavourite) {
      return -1;
    }
    return 1;
  };
};
