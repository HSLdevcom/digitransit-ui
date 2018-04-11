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
    browser.url(browser.launch_url);

    browser.page.searchFields().itinerarySearch('Katajanokka', 'Kauppatori');
    browser.page.itinerarySummary().waitForFirstItineraryRow();

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.openQuickSettings();
    customizeSearch.disableAllModalitiesExcept('citybike');
    customizeSearch.enableModality('citybike');

    browser.page.itinerarySummary().waitForItineraryRowOfType('citybike');

    browser.end();
  },

  'Citybikes are not used when disabled': browser => {
    browser.url(browser.launch_url);

    browser.page.searchFields().itinerarySearch('Katajanokka', 'Kauppatori');
    browser.page.itinerarySummary().waitForFirstItineraryRow();

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.openQuickSettings();
    customizeSearch.disableAllModalitiesExcept();

    browser.page
      .itinerarySummary()
      .waitForItineraryRowOfTypeNotPresent('citybike');

    browser.end();
  },
};
