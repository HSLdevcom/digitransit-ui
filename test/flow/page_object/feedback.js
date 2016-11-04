function close() {
  this.api.checkedClick(this.elements.close.selector);
  return this.waitForElementNotPresent('@close', 2000);
}

module.exports = {
  commands: [{ close }],
  elements: {
    close: '#feedback-close-icon',
  },
};
