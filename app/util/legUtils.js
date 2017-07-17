function filterLegStops(leg, filter) {
  if (leg.from.stop && leg.to.stop && leg.trip) {
    const stops = [leg.from.stop.gtfsId, leg.to.stop.gtfsId];
    return leg.trip.stoptimes.filter(stoptime => (stops.indexOf(stoptime.stop.gtfsId) !== -1))
    .filter(filter);
  }
  return false;
}

/**
 * Check if legs start stop pickuptype or end stop pickupType is CALL_AGENCY
 *
 * leg must have:
 * from.stop.gtfsId
 * to.stop.gtfsId
 * trip.stoptimes (with props:)
 *   stop.gtfsId
 *   pickupType
 */
export function isCallAgencyPickupType(leg) {
  return filterLegStops(leg, stoptime => (stoptime.pickupType === 'CALL_AGENCY')).length > 0;
}

export function isCallAgencyDeparture(departure) {
  return departure.pickupType === 'CALL_AGENCY';
}
