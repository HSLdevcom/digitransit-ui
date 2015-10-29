describe('Route Page', function () {
  before(function (browser, done) {
    require('./browser-upgrade.js')(browser);
    browser.url("http://127.0.0.1:8080/linjat/HSL:1006:1:01?mock", function () {
      done()
    });
  });

  after(function (browser, done) {
    browser.end(function () {
      done();
    });
  });

  describe('when location is known', function () {
    before(function (browser, done) {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    it('should contain walk distance to nearest stop', function (browser) {
      browser.expect.element('span.walk-distance').to.be.present.before(2000);
    });
  });
});
