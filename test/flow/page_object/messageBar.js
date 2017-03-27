function close() {
  this.api.element('css selector', this.elements.messageBar.selector, (result) => {
    if (result.state === 'success') {
      this.api.debug('closing message bar');
      this.waitForElementVisible('@messageBarClose', this.api.globals.elementVisibleTimeout);
      this.api.debug('clicking close');
      this.api.checkedClick(this.elements.messageBarClose.selector);
      this.api.debug('waiting for messagebar to close');
      this.waitForElementNotPresent('.message-bar', this.api.globals.elementVisibleTimeout);
    }
  });
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
