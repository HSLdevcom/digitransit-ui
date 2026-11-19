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
