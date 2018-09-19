/**
 * Runs a check to see if the code is currently running in a browser.
 */
export const getIsBrowser = () =>
  typeof window !== 'undefined' && window !== null;

export const isBrowser = getIsBrowser();
export const isIOSApp = isBrowser && navigator.standalone;

export const isWindowsPhone =
  isBrowser && navigator.userAgent.match(/Windows Phone/) != null;
export const isLangMockEn =
  isBrowser && window.location.search.indexOf('enmock') !== -1;
export const isDebugTiles =
  isBrowser && window.location.search.indexOf('debugTiles') !== -1;
export const isMobile =
  isBrowser && navigator.userAgent.match(/Mobile/) != null;
export const isFirefox =
  isBrowser && navigator.userAgent.match(/Firefox/) != null;
export const isAndroid =
  isBrowser && navigator.userAgent.match(/Android/) != null;
export const isChrome =
  isBrowser && navigator.userAgent.match(/Chrome/) != null;
export const isSamsungBrowser =
  isBrowser && navigator.userAgent.match(/SamsungBrowser/) != null;
export const isIe = isBrowser && navigator.userAgent.match(/Trident/) != null;
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
