function waitClose() {
  this.api.debug('waiting for splash to disappear');
  this.waitForElementNotPresent('@splash', this.api.globals.elementVisibleTimeout);
}

module.exports = {
  commands: [{ waitClose }],
  elements: {
    splash: '#splash-wrapper',
  },
};
