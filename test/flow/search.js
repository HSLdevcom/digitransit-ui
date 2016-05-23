const suite = require('./api/suite.js').suite;


function setOrigin(browser, src) {
  browser.fakeSearch.openSearch();
  browser.origin.selectOrigin();
  browser.origin.enterText(src);
}

function setDestination(browser, src) {
  browser.fakeSearch.openSearch();
  browser.destination.selectDestination();
  browser.destination.enterText(src);
}

suite('Search', () => {
  describe('When Origin is manually set to other than Kammpi', () => {
    before((browser, done) => {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    it('Source should be set to kamppi when kamppi is entered to source', (browser) => {
      setOrigin(browser, 'kamppi');
      browser.fakeSearch.openSearch();
      browser.origin.selectOrigin();
      browser.expect.element('#search-origin').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
      browser.expect.element('#search-origin').value.to
        .contain('Kamppi, long distance traffic, Helsinki');
    });

    it('Route search should be run when both source and destination are set', (browser) => {
      setDestination(browser, 'sampsantie 40');
      browser.expect.element('.itinerary-summary-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });
  });

  describe('When position is geocoded to Lidl Kamppi', () => {
    before((browser, done) => {
      browser.url('/?mock');
      browser.setCurrentPosition(60.168201, 24.93079, 0, done);
    });

    it('Should automatically route after position is set', (browser) => {
      setDestination(browser, 'Aurinkolahti');
      browser.expect.element('.itinerary-summary-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });

    it('Should route to details page when first itinerary is clicked', (browser) => {
      browser.click('.itinerary-summary-row:first-of-type');
      browser.expect.element('.itinerary-leg-first-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });

    it('Should have the geocoded address (not poi) as origin', (browser) => {
      browser.expect.element('div.itinerary-leg-first-row > div:nth-child(2)')
        .text.to.contain('Kampinkuja 2');
    });
  });
});
