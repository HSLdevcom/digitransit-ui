/**
 * Handle typing time and adding necessary :
 *
 * @param {string} typedValue
 *
 * @return {string}
 */
function parseTypedTime(typedValue) {
  let actualValue = typedValue;
  if (
    actualValue.length === 3 &&
    actualValue.split('').every(n => Number.isInteger(Number(n)))
  ) {
    // add ':' if user types three numbers in a row
    if (Number(actualValue.slice(0, 2)) <= 23) {
      actualValue = `${actualValue.slice(0, 2)}:${actualValue[2]}`;
    } else {
      actualValue = `${actualValue[0]}:${actualValue.slice(1)}`;
    }
  }
  return actualValue;
}

export default { parseTypedTime };
