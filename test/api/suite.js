/* eslint prefer-arrow-callback: "off" */
require('./browser-upgrade.js');

function suite(name, fn) {
  describe(name, function () {
    this.timeout(120000);

    before(function (browser, done) {
      require('./browser-upgrade.js')(browser);
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
