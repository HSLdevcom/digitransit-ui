/**
 * @module digitransit-search-util-tru-eq
 * @deprecated Merged into `@digitransit-util/digitransit-util` as
 * `isTruthyAndEqual`, an internal helper that isn't exported. This package
 * will be removed in a future release.
 */
/**
 *  accept equality of non nullish values
 *
 * @name truEq
 * @param {Boolean|Number|BigInt|String|Symbol|Object} val1 First value to be compared
 * @param {Boolean|Number|BigInt|String|Symbol|Object} param2 Second value to be compared
 * @returns {Boolean} true/false
 * @example
 * digitransit-util.truEq('2', '2');
 * //=true
 */
export default function truEq(val1, val2) {
  return val1 && val2 && val1 === val2;
}
