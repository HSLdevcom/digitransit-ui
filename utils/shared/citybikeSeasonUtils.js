export const dayMs = 24 * 60 * 60 * 1000;

export function seasonMs(ddmmyyyy) {
  const parts = ddmmyyyy.split('.');
  const year = parts.length > 2 ? parts[2] : new Date().getFullYear();
  return new Date(year, parts[1] - 1, parts[0]).valueOf();
}

export function isCitybikeSeasonActive(season) {
  if (!season) {
    return false;
  }
  if (season.alwaysOn) {
    return true;
  }
  const now = Date.now();
  return now <= seasonMs(season.end) + dayMs && now >= seasonMs(season.start);
}

export function networkIsActive(network) {
  return network?.enabled && isCitybikeSeasonActive(network?.season);
}
