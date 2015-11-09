describe('Route Page', function () {
  this.timeout(120000);

  before(function (browser, done) {
    require('./browser-upgrade.js')(browser);
    browser.init("/linjat/HSL:1006:1:01", function () {
      done()
    });
  });

  after(function (browser, done) {
    browser.finish(done);
  });

  describe('when location is known', function () {
    before(function (browser, done) {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    it('should contain walk distance to nearest stop', function (browser) {
      browser.expect.element('span.walk-distance').to.be.present;
    });
  });
});
