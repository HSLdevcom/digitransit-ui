exports.command = function checkedClick(selector) {
  this.click(selector, result => {
    if (result.status !== 0) {
      this.assert.fail(result.status, 0,
        `Problem clicking UI (selector:${selector}): ${result.value.message}`);
    }
  });
};
