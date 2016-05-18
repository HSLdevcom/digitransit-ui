const suite = require('./api/suite.js').suite;

suite('Search', () => {
  describe('When Origin is manually set to "Kamppi"', () => {
    before((browser, done) => {
      browser.setCurrentPosition(60.2, 24.95, 0, done);
    });

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

    it('Source should be set to kamppi when kamppi is entered to source', (browser) => {
      setOrigin(browser, 'kamppi');
      browser.fakeSearch.openSearch();
      browser.origin.selectOrigin();
      browser.expect.element('#search-origin').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
      browser.expect.element('#search-origin').value.to
        .contain('Kamppi, long distance traffic, Helsinki');
    });

    it('Destination should be set to kamppi when kamppi is entered to destination,' +
         ' also a route search should be performed',
       (browser) => {
         browser.url('/');
         setDestination(browser, 'kamppi');
         // TODO: create destination tests when summary page is ready
       }
    );

    describe('After route search', () => {
      before((browser, done) => {
        browser.url('/');
        setOrigin(browser, 'kamppi');
        setDestination(browser, 'sampsantie 40');
        browser.pause(4000);
        done();
      });

      it('Route search should be run when both source and destination are set', (browser) => {
        browser.pause(4000);
        browser.expect.element('.itinerary-summary-row').to.be.visible
          .before(browser.ELEMENT_VISIBLE_TIMEOUT);
      });

      describe('When returning to front-page and changing origin', () => {
        before((browser, done) => {
          browser.pause(4000);
          browser.url('/');
          browser.pause(4000);
          setOrigin(browser, 'aurinkolahti');
          browser.pause(4000);
          done();
        });

        it('Search is not done because destination is cleared', (browser) => {
          browser.pause(50000);
          browser.expect.element('.itinerary-summary-row').to.not.be.visible.after(browser.ELEMENT_VISIBLE_TIMEOUT);
        });
      });
    });
  });
});
