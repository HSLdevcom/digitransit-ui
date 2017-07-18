exports.command = function checkedClick(selector) {
  this.debug(`Waiting element to be visible "${selector}"`);
  this.waitForElementVisible(selector, this.globals.elementVisibleTimeout);
  this.debug(`Click "${selector}"`);
  this.click(selector, result => {
    if (result.status !== 0) {
      this.assert.fail(
        result.status,
        0,
        `Problem clicking UI (selector:${selector}): ${result.value.message}`,
      );
    }
  });
  this.debug('Clicking succeeded.');
};
