import { PREFIX_ITINERARY_SUMMARY } from '../../../../app/util/path';

const moment = require('moment');

module.exports = {
  '@disabled': true, // TODO: change this whenever citybike period starts/ends
  tags: ['citybike'],
  'Citybike tests should be disabled during winter period': browser => {
    const month = moment().month() + 1;
    const winterMonths = [11, 12, 1, 2, 3];
    if (winterMonths.includes(month)) {
      browser.assert.fail('Citybike tests should be disabled in winter');
    }
  },

  "Citybikes are used when it's the only modality": browser => {
    browser.url(
      `http://localhost:8080/${PREFIX_ITINERARY_SUMMARY}/Katajanokka%3A%3A60.16716%2C24.97992/Kauppatori%3A%3A60.16736%2C24.95171?modes=WALK%2CCITYBIKE`,
    );
    browser.page.itinerarySummary().waitForItineraryRowOfType('citybike');

    browser.end();
  },

  'Citybikes are not used when disabled': browser => {
    browser.url(
      `http://localhost:8080/${PREFIX_ITINERARY_SUMMARY}/Katajanokka%3A%3A60.16716%2C24.97992/Kauppatori%3A%3A60.16736%2C24.95171?modes=WALK`,
    );
    browser.page.itinerarySummary().waitForFirstItineraryRow();

    browser.page
      .itinerarySummary()
      .waitForItineraryRowOfTypeNotPresent('citybike');

    browser.end();
  },
};
