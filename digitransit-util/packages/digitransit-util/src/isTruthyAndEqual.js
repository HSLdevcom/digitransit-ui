/**
 * Returns true when both values are truthy and strictly equal.
 *
 * @name isTruthyAndEqual
 * @private
 * @param {Boolean|Number|BigInt|String|Symbol|Object} val1 First value to be compared
 * @param {Boolean|Number|BigInt|String|Symbol|Object} param2 Second value to be compared
 * @returns {Boolean} true/false
 * @example
 * isTruthyAndEqual('2', '2');
 * //=true
 */
export default function isTruthyAndEqual(val1, val2) {
  return val1 && val2 && val1 === val2;
}
