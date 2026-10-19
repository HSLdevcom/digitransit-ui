const VEHICLE_ARRIVING = 'arriving';
const VEHICLE_ARRIVED = 'arrived';
const VEHICLE_DEPARTED = 'departed';

export default function getVehicleState(
  distanceToStop,
  maxDistance,
  vehicleTime,
  arrivalTimeToStop,
  departureTimeFromStop,
  first,
  last,
) {
  let vehicleState;
  if (
    distanceToStop > maxDistance &&
    vehicleTime < arrivalTimeToStop &&
    !first
  ) {
    vehicleState = VEHICLE_ARRIVING;
  } else if (
    (vehicleTime >= arrivalTimeToStop && vehicleTime < departureTimeFromStop) ||
    (first && vehicleTime < arrivalTimeToStop) ||
    (last && vehicleTime >= departureTimeFromStop) ||
    distanceToStop <= maxDistance
  ) {
    vehicleState = VEHICLE_ARRIVED;
  }
  if (vehicleTime >= departureTimeFromStop && !last) {
    return VEHICLE_DEPARTED;
  }
  return vehicleState;
}
