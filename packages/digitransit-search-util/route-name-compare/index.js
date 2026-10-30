/**
 * Compares routenames
 *
 * @name routeNameCompare
 * @param {Object} a {
 *  shortName: String,
 *  longName: String,
 *   agency: {
 *      name: String
 *    }
 * }
 * @param {Object} b Same as a
 * @returns {Number} 0 True -1 false
 * @example
 * const a = {
 *  shortName: 'hki',
 *  longName: 'Helsinki',
 *  agency: {
 *    name: 'hsl',
 *  },
 * };
 * const b = {
 *  shortName: 'hki',
 *  longName: 'Helsinki',
 *   agency: {
 *     name: 'hsl',
 *   },
 *  };
 * digitransit-search-util.routeNameCompare(a, b);
 * //= 0
 */
export default function routeNameCompare(a, b) {
  const a1 =
    a.shortName ||
    a.longName ||
    (a.agency && a.agency.name ? a.agency.name : '');
  const b1 =
    b.shortName ||
    b.longName ||
    (b.agency && b.agency.name ? b.agency.name : '');

  const aNum = parseInt(a1, 10);
  const bNum = parseInt(b1, 10);

  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
    if (aNum < bNum) {
      return -1;
    }
    if (aNum > bNum) {
      return 1;
    }
  }

  const primary = a1.localeCompare(b1);
  if (primary !== 0) {
    return primary;
  }

  const a2 = a.longName || (a.agency && a.agency.name ? a.agency.name : '');
  const b2 = b.longName || (b.agency && b.agency.name ? b.agency.name : '');

  const secondary = a2.localeCompare(b2);
  if (secondary !== 0) {
    return secondary;
  }

  const a3 = a.agency && a.agency.name ? a.agency.name : '';
  const b3 = b.agency && b.agency.name ? b.agency.name : '';

  return a3.localeCompare(b3);
}
