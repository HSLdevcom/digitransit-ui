const isBrowser = typeof window !== 'undefined' && window !== null;
const isEdge = isBrowser && navigator.userAgent.match(/Edge/) != null;
const isChrome =
  isBrowser && !isEdge && navigator.userAgent.match(/Chrome/) != null;

export const isIOS =
  isBrowser && !!navigator.platform.match(/iPhone|iPod|iPad/);
export const isLangMockEn =
  isBrowser && window.location.search.indexOf('enmock') !== -1;
export const isMobile =
  isBrowser && navigator.userAgent.match(/Mobile/) != null;
export const isAndroid =
  isBrowser && navigator.userAgent.match(/Android/) != null;
export const isSafari =
  isBrowser &&
  !isChrome &&
  !isEdge &&
  navigator.userAgent.match(/Safari/) != null;
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
