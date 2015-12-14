var suite = require('./api/suite.js').suite;

suite('Search', function () {
  before(function (browser, done) {

  });

  describe('When Origin is manually set to "Kamppi"', function () {
    it('should remain set to "Kamppi" when Origin input receives and loses focus', function (browser) {

    });

    it('should be possible to write Destination or use current position', function (browser) {

    });

    it('should show special position marker because position is manually set', function (browser) {
      // blue marker
    });

    it('should use "Sampsantie 40, Helsinki" address when Destination is written as "sampsantie 40"', function (browser) {

    });
  });

  describe('When Origin is "My position"', function () {
    it('should show animated user position marker', function (browser) {
      // user position
    });
  });

  describe('When Origin and Destination are set', function () {
    it('should read values from session store during browser back', function (browser) {

    });
  });
});
