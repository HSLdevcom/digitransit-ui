/**
 *  Detect if user is on a mobile device by parsing userAgent. This is not 100% reliable but close enough.
 *
 * @return {boolean}
 */
function isMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
    userAgent,
  );
  return mobile;
}

/**
 * Detect if user is on an android device. Not 100% reliable.
 */
function isAndroid() {
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.indexOf('android') > -1;
}

export { isMobile, isAndroid };
