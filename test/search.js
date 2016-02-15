var suite = require('./api/suite.js').suite;
var SLEEP_TIME = 1000;

suite('Search', function () {

  describe('When Origin is manually set to "Kamppi"', function () {

    before(function (browser, done) {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    function setOrigin(browser, src) {
      browser.origin.openSearch();
      browser.origin.enterText(src);
    }

    function setDestination(browser, src) {
      browser.destination.openSearch();
      browser.destination.enterText(src);
    }

    it('Source should be set to kamppi when kamppi is entered to source', function (browser) {
      setOrigin(browser, 'kamppi')
      browser.expect.element('div#origin>div.input-placeholder>div.address-input').to.be.visible.before(browser.ELEMENT_VISIBLE_TIMEOUT);
      browser.expect.element('div#origin>div.input-placeholder>div.address-input').text.to.contain("Kamppi, Helsinki");
    });

    it('Destination should be set to kamppi when kamppi is entered to destination, also a route search should be performed', function (browser) {
      browser.url("/");
      setDestination(browser, "kamppi")
      browser.expect.element('div#destination>div.input-placeholder>div.address-input').to.be.visible.before(browser.ELEMENT_VISIBLE_TIMEOUT);
      browser.expect.element('div#destination>div.input-placeholder>div.address-input').text.to.contain("Kamppi, Helsinki");
      browser.expect.element('.itinerary-summary-row').to.be.visible.before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });

    it('Route search should be run when both source and destination are set', function (browser) {
      browser.url("/");
      setOrigin(browser, "kamppi")
      setDestination(browser, "sampsantie 40")
      browser.expect.element('.itinerary-summary-row').to.be.visible.before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });

  });

});
