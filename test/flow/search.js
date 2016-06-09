const suite = require('./api/suite.js').suite;


const setOrigin = (browser, src) => 
  browser.fakeSearch.openSearch()
    .origin.selectOrigin()
    .origin.enterText(src)

const setDestination = (browser, src) =>
  browser.fakeSearch.openSearch()
    .destination.selectDestination()
    .destination.enterText(src)

suite('Search', () => {
  describe('When Origin is manually set to other than Kamppi', () => {
    before((browser, done) => {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

    it('Should show show origin popup after source is entered', (browser) =>
      setOrigin(browser, 'kamppi')
        .fakeSearch.openSearch()
        .origin.selectOrigin().expect.element('#search-origin').to.be.visible.before(browser.ELEMENT_VISIBLE_TIMEOUT)
    );

    it('Source should be set to kamppi when kamppi is entered to source', (browser) => {
      browser
        .expect.element('#search-origin').value
        .to.contain('Kamppi, long distance traffic, Helsinki')
    });

    describe('After route search', () => {
      before((browser, done) => {
        browser.url('/')
        setOrigin(browser, 'kamppi')
        setDestination(browser, 'sampsantie 40');
        done();
      });

      it('Route search should be run when both source and destination are set', (browser) => {
        browser.expect.element('.itinerary-summary-row').to.be.visible
          .before(browser.ELEMENT_VISIBLE_TIMEOUT);
      });

      it('should go back to front page when clicking back', (browser) => {
        browser.back.click().pause(500).assert.title('Reittiopas.fi');
      });

      it('should not search again when changig origin', (browser) => {
        setOrigin(browser, 'aurinkolahti')
          // wait for dialog to vanish and possible changes to occur
          .pause(500).assert.title('Reittiopas.fi');
      });
    });
  });

  describe('When position is geocoded to Lidl Kamppi', () => {
    before((browser, done) => {
      browser.url('/?mock')
        .pause(500)
        .setCurrentPosition(60.168201, 24.93079, 0)
        .pause(500, done)
    });

    it('Should automatically route after position is set', (browser) => {
      setDestination(browser, 'Aurinkolahti');
      browser.expect.element('.itinerary-summary-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });

    it('Should route to details page when first itinerary is clicked', (browser) => {
      browser.click('.itinerary-summary-row:first-of-type')
        .expect.element('.itinerary-leg-first-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
    });

    it('Should have the geocoded address (not poi) as origin', (browser) => {
      browser.expect.element('div.itinerary-leg-first-row')
        .text.to.contain('Kampinkuja 2');
    });
  });
});
