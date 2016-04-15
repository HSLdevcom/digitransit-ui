module.exports = (mode) => {
  const selector = mode.toLowerCase();
  for (const index in document.styleSheets) {
    try {
      document.styleSheets[index].cssRules.length;
    } catch (err) {
      continue;
    }
    for (const index2 in document.styleSheets[index].cssRules) {
      if (document.styleSheets[index].cssRules[index2].selectorText === selector) {
        return document.styleSheets[index].cssRules[index2];
      }
    }
  }
  return false;
};
