var suite = require('./api/suite.js').suite;

suite('Search', function () {
  before(function (browser, done) {
    browser.setCurrentPosition(60.2, 24.95, 0, done);
  });

  describe.only('When Origin is manually set to "Kamppi"', function () {

    before(function (browser, done) {
      browser.origin.disableCurrentPosition(function(){
        browser.origin.enableInput(function() {
          browser.origin.enterText("Kamppi", done);
        })
      })
    });

    it('should remain set to "Kamppi" when Origin input receives and loses focus', function (browser) {
      browser.assert.value('#origin-autosuggest > div:nth-child(1) > input[type=text]', "Kamppi, Helsinki");
      browser.origin.clickInput(function(){
        browser.assert.value('#origin-autosuggest > div:nth-child(1) > input[type=text]', "Kamppi, Helsinki");
        browser.map.click(function(){
          browser.assert.value('#origin-autosuggest > div:nth-child(1) > input[type=text]', "Kamppi, Helsinki");
        })
      });

    });

    it('should be possible to write Destination', function (browser) {
      browser.end()
    });

    it('should be possible to use current position', function (browser) {
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
