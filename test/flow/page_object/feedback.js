function close() {
  this.click('@close');
  this.api.pause(2000);
  return this.waitForElementNotPresent('@close', 2000);
}

module.exports = {
  commands: [{ close }],
  elements: {
    close: '#feedback-close-icon',
  },
};
