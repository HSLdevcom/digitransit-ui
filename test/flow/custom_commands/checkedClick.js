exports.command = function checkedClick(...args) {
  this.click(...args, result => {
    if (result.status !== 0) {
      this.assert.fail(result.status, 0, 'Problem clicking link');
    }
  });
};
