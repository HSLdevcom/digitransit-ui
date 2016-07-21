function close() {
  this.click('@close');
  this.api.pause(500);
  return this.waitForElementNotPresent('@close', 500);
}

module.exports = {
  commands: [{ close }],
  elements: {
    close: '#feedback-close-icon',
  },
};
