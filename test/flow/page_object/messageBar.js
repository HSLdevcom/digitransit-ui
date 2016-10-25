function close() {
  this.api.debug('closing message bar');
  this.waitForElementVisible('@messageBarClose', this.api.globals.elementVisibleTimeout);
  this.api.debug('clicking close');
  this.click('@messageBarClose');
  this.api.debug('waiting for messagebar to close');
  this.waitForElementNotPresent('.message-bar', this.api.globals.elementVisibleTimeout);
}


module.exports = {
  commands: [{
    close,
  }],
  elements: {
    messageBar: '.message-bar',
    messageBarClose: '#close-message-bar > span > svg',
  },
};
