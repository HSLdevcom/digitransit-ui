var suite = require('./api/suite.js').suite;

suite('Search', function () {
  before(function (browser, done) {
    done()
  });

  describe('When Origin is manually set to "Kamppi"', function () {
    it('should remain set to "Kamppi" when Origin input receives and loses focus', function (browser) {
      browser.end()
    });

    it('should be possible to write Destination or use current position', function (browser) {
      browser.end()
    });

    it('should show special position marker because position is manually set', function (browser) {
      // blue marker
      browser.end()
    });

    it('should use "Sampsantie 40, Helsinki" address when Destination is written as "sampsantie 40"', function (browser) {
      browser.end()
    });
  });

  describe('When Origin is "My position"', function () {
    it('should show animated user position marker', function (browser) {
      // user position
      browser.end()
    });
  });

  describe('When Origin and Destination are set', function () {
    it('should read values from session store during browser back', function (browser) {
      browser.end()
    });
  });
});
