module.exports = (mode) => {
  const selector = mode.toLowerCase();
  for (const index in document.styleSheets) {
    if ({}.hasOwnProperty.call(document.styleSheets, index)) {
      try {
        for (const index2 in document.styleSheets[index].cssRules) {
          if (document.styleSheets[index].cssRules[index2].selectorText === selector) {
            return document.styleSheets[index].cssRules[index2];
          }
        }
      } catch (err) {
        continue;
      }
    }
  }
  return false;
};
