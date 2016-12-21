export default function routeCompare(routea, routeb) {
  if (routea.agency && routea.agency.name && routeb.agency && routeb.agency.name) {
    const agencyCompare = routea.agency.name.localeCompare(routeb.agency.name);
    if (agencyCompare !== 0) {
      return agencyCompare;
    }
  }
  const partsA = (routea.shortName || '').match(/^[A-Za-z]?(0*)([0-9]*)/);
  const partsB = (routeb.shortName || '').match(/^[A-Za-z]?(0*)([0-9]*)/);
  if (partsA[1].length !== partsB[1].length) {
    if (partsA[1].length + partsA[2].length === 0) {
      return -1; // A is the one with no numbers at all, wins leading zero
    } else if (partsB[1].length + partsB[2].length === 0) {
      return 1; // B is the one with no numbers at all, wins leading zero
    }
    return partsB[1].length - partsA[1].length; // more leading zeros wins
  }
  const numberA = parseInt(partsA[2] || '0', 10);
  const numberB = parseInt(partsB[2] || '0', 10);
  return numberA - numberB ||
    (routea.shortName || '')
    .localeCompare(routeb.shortName || '') || (routea.longName || '')
    .localeCompare(routeb.longName || '');
}
