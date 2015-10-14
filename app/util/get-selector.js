module.exports = function (selector) {
  selector = selector.toLowerCase()
  for(i in document.styleSheets) {
    try { document.styleSheets[i].cssRules.length; } catch(err) { continue; }
    for(j in document.styleSheets[i].cssRules) {
      if(document.styleSheets[i].cssRules[j].selectorText==selector) return document.styleSheets[i].cssRules[j];
    }
  }
  return false;
}
