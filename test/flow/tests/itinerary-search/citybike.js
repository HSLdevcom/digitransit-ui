const moment = require('moment');

module.exports = {
  '@disabled': false, // TODO: remove citybikes on 2018-10-31
  tags: ['citybike'],
  'Citybikes should be removed after 2018-10-31': browser => {
    if (moment().date() > moment('2018-10-31').date()) {
      browser.assert.fail('Citybikes should be removed by now');
    }
  },

  "Citybikes are used when it's the only modality": browser => {
    browser.url(
      'http://localhost:8080/reitti/Katajanokka%3A%3A60.16716%2C24.97992/Kauppatori%3A%3A60.16736%2C24.95171?modes=WALK%2CCITYBIKE',
    );
    browser.page.itinerarySummary().waitForItineraryRowOfType('citybike');

    browser.end();
  },

  'Citybikes are not used when disabled': browser => {
    browser.url(
      'http://localhost:8080/reitti/Katajanokka%3A%3A60.16716%2C24.97992/Kauppatori%3A%3A60.16736%2C24.95171?modes=WALK',
    );
    browser.page.itinerarySummary().waitForFirstItineraryRow();

    browser.page
      .itinerarySummary()
      .waitForItineraryRowOfTypeNotPresent('citybike');

    browser.end();
  }
};
