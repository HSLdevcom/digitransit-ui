exports.command = function(f) {
  this.useXpath();
  f();
  this.useCss();
};
