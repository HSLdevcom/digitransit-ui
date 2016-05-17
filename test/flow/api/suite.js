/* eslint prefer-arrow-callback: 0 */
require('./browser-upgrade.js');

function suite(name, fn) {
  describe(name, function () {
    this.timeout(120000);

    before(function (browser, done) {
      require('./browser-upgrade.js')(browser); // eslint-disable-line global-require
      browser.init(done);
    });

    after(function (browser, done) {
      browser.finish(done);
    });

    fn();
  });
}

module.exports = {
  suite,
};
