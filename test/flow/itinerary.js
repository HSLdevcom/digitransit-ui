const suite = require('./api/suite.js').suite;

suite('Itinerary', () => {
  describe('When we go to summary page', () => {
    it('finds a route', (browser) => {
      browser.url('/reitti/Ratamestarinkatu%206%2C%20Helsinki%3A%3A60.1992385%2C24.9397229/' +
                  'Majurinkulma%202%2C%20Espoo%3A%3A60.211233%2C24.825391');
      browser.expect.element('.itinerary-summary-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
      browser.click('div.action-arrow');
      browser.expect.element('.itinerary-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT);
    }
    );
  });
});
