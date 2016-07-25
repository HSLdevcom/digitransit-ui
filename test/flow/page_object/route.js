function waitForWalkDistance() {
  return this.waitForElementVisible('@walkDistance', this.api.globals.elementVisibleTimeout);
}

module.exports = {
  commands: [{ waitForWalkDistance }],
  elements: {
    walkDistance: 'span.walk-distance',
  },
};
