exports.command = f => {
  this.useXpath();
  f();
  this.useCss();
};
