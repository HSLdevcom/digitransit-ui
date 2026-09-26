/**
 * Returns true (and prevents the default action) when a keyboard event is a
 * selection key press, i.e. Enter or Space.
 *
 * @name isKeyboardSelectionEvent
 * @param {KeyboardEvent} event
 * @returns {boolean}
 */
const isKeyboardSelectionEvent = event => {
  const enter = [13, 'Enter'];
  const space = [32, ' ', 'Spacebar'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';

  if (!key || !enter.concat(space).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};

export default isKeyboardSelectionEvent;
