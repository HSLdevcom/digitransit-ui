const suite = require('./api/suite.js').suite;

suite('Route Page', () => {
  describe('when location is known', () => {
    before((browser, done) => {
      browser.url('/linjat/HSL:1006:1:01')
        .setCurrentPosition(60.2, 24.95, 0, done);
    });

    it('should contain walk distance to nearest stop', (browser) => {
      browser.expect.element('span.walk-distance').to.be.present
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });
  });
});
