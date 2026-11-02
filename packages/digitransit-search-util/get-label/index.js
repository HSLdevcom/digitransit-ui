import { getNameLabel } from '@digitransit-search-util/digitransit-search-util-uniq-by-label';
/**
 * Returns label for properties
 *
 * @name getLabel
 * @param {*} properties object
 * @returns {Boolean} true/false
 */
export default function getLabel(properties) {
  const parts = getNameLabel(properties, true);
  switch (properties.layer) {
    case 'selectFromMap':
    case 'currentPosition':
    case 'ownLocations':
    case 'back':
      return parts[1] || parts[0];
    case 'favouriteVehicleRentalStation':
    case 'favouritePlace':
      return parts[0];
    default:
      return parts.length > 1 && parts[1] !== ''
        ? parts.join(', ')
        : parts[1] || parts[0];
  }
}
