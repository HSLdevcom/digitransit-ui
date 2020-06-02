/**
 * Detect if input type="date" and type="time" are supported in by the browser
 *
 * @return {boolean}
 */
function dateTimeInputIsSupported() {
  const elem = document.createElement('input');
  elem.type = 'date';
  if (elem.type !== 'date') {
    return false;
  }
  elem.type = 'time';
  if (elem.type !== 'time') {
    return false;
  }
  return true;
}

export default dateTimeInputIsSupported;
