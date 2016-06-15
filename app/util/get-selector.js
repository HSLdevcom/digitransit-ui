/* eslint no-restricted-syntax: 0 */

module.exports = (mode) => {
  const selector = mode.toLowerCase();
  for (const index in document.styleSheets) {
    // Use hasOwnProperty from the {} to make sure styleSheets hasn't overridden it
    if ({}.hasOwnProperty.call(document.styleSheets, index)) {
      try {
        for (const index2 in document.styleSheets[index].cssRules) {
          if ({}.hasOwnProperty.call(document.styleSheets[index].cssRules, index2)) {
            const ref = document.styleSheets[index].cssRules[index2].selectorText;
            if (ref && ref.split(',').indexOf(selector) > -1) {
              return document.styleSheets[index].cssRules[index2];
            }
          }
        }
      } catch (err) {
        continue;
      }
    }
  }
  return false;
};
