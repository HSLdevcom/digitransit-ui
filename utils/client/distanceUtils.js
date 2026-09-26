import { isImperial } from './browser';

export function displayImperialDistance(meters) {
  const feet = meters * 3.2808399;

  if (feet < 100) {
    return `${Math.round(feet / 10) * 10} ft`; // Tens of feet
  }
  if (feet < 1000) {
    return `${Math.round(feet / 50) * 50} ft`; // fifty feet
  }
  return `${Math.round(feet / 528) / 10} mi`; // tenth of a mile
}

/**
 * Returns distance with locale format (fraction digits is 1)
 * e.g. fi/sv - 20,1 km, en - 20.1 km
 * @param {*} meters
 * @param {*} formatNumber
 */
function displayDistanceWithLocale(meters, formatNumber) {
  const opts = {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  };
  if (meters < 100) {
    return `${formatNumber((Math.round(meters / 10) * 10).toFixed(1))} m`; // Tens of meters
  }
  if (meters < 975) {
    return `${formatNumber((Math.round(meters / 50) * 50).toFixed(1))} m`; // fifty meters
  }
  if (meters < 10000) {
    return `${formatNumber(
      ((Math.round(meters / 100) * 100) / 1000).toFixed(1),
      opts,
    )} km`; // hudreds of meters
  }
  if (meters < 100000) {
    return `${formatNumber(Math.round(meters / 1000).toFixed(1), opts)} km`; // kilometers
  }
  return `${formatNumber(
    (Math.round(meters / 10000) * 10).toFixed(1),
    opts,
  )} km`; // tens of kilometers
}

export function displayDistance(meters, config, formatNumber) {
  if (config.alwaysShowDistanceInKm) {
    return `${(meters / 1000).toFixed(1)}  km`;
  }
  if (isImperial(config)) {
    return displayImperialDistance(meters);
  }
  if (formatNumber) {
    return displayDistanceWithLocale(meters, formatNumber);
  }
  if (meters < 100) {
    return `${Math.round(meters / 10) * 10} m`; // Tens of meters
  }
  if (meters < 975) {
    return `${Math.round(meters / 50) * 50} m`; // fifty meters
  }
  if (meters < 10000) {
    return `${(Math.round(meters / 100) * 100) / 1000} km`; // hudreds of meters
  }
  if (meters < 100000) {
    return `${Math.round(meters / 1000)} km`; // kilometers
  }
  return `${Math.round(meters / 10000) * 10} km`; // tens of kilometers
}
