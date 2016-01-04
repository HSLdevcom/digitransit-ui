var suite = require('./api/suite.js').suite;

suite('Route Page', function () {
  before(function (browser, done) {
    browser.init("/linjat/HSL:1006:1:01", done);
  });

  describe('when location is known', function () {
    before(function (browser, done) {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    it('should contain walk distance to nearest stop', function (browser) {
      browser.expect.element('span.walk-distance').to.be.present.before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });
  });
});
