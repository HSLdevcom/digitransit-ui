function verifyPage() {
  this.waitForElementVisible('@aboutHeader', this.api.globals.elementVisibleTimeout);
  return this.assert.containsText('@aboutHeader', 'About this service');
}

module.exports = {
  commands: [{
    verifyPage,
  }],
  elements: {
    aboutHeader: '.about-header:nth-of-type(1)',
  },
};
