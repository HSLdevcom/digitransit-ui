exports.command = function withXPath(f) {
  this.useXpath();
  f();
  this.useCss();
};
