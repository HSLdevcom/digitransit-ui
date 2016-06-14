const suite = require('./api/suite.js').suite;

suite('Itinerary', () => {
  before((browser, done) => {
    browser.init(
      '/reitti/Ratamestarinkatu%206%2C%20Helsinki%3A%3A60.1992385%2C24.9397229/' +
      'Majurinkulma%202%2C%20Espoo%3A%3A60.211233%2C24.825391'
      , done
    );
  });

  describe('When we go to summary page', () => {
    it('finds a route', (browser) =>
      browser
        .expect.element('.itinerary-summary-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT)
    );

    it('navigates to itinerary page when clocked', (browser) =>
      browser
        .click('div.action-arrow')
        .expect.element('.itinerary-row').to.be.visible
        .before(browser.ELEMENT_VISIBLE_TIMEOUT)
    );
  });
});
