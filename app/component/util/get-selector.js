module.exports = function (selector) {
   selector = selector.toLowerCase()
   for(i in document.styleSheets) {
      for(j in document.styleSheets[i].cssRules) {
         console.log()
         if(document.styleSheets[i].cssRules[j].selectorText==selector) return document.styleSheets[i].cssRules[j];
      }
   }
   return false;
}
