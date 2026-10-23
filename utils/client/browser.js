const isEdge = navigator.userAgent.match(/Edge/) != null;
const isChrome = !isEdge && navigator.userAgent.match(/Chrome/) != null;

export const isIOS = !!navigator.platform.match(/iPhone|iPod|iPad/);
export const isAndroid = navigator.userAgent.match(/Android/) != null;
export const isSafari =
  !isChrome && !isEdge && navigator.userAgent.match(/Safari/) != null;
export const isImperial = config => {
  if (
    config.imperialEnabled &&
    (String(navigator.userLanguage).toLowerCase() === 'en-us' ||
      String(navigator.language).toLowerCase() === 'en-us')
  ) {
    return true;
  }
  return false;
};

export const isKeyboardSelectionEvent = event => {
  const space = [13, ' ', 'Spacebar'];
  const enter = [32, 'Enter'];
  const key = (event && (event.key || event.which || event.keyCode)) || '';

  if (!key || !space.concat(enter).includes(key)) {
    return false;
  }
  event.preventDefault();
  return true;
};
