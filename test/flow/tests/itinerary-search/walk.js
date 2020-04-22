import { PREFIX_ITINERARY_SUMMARY } from '../../../../app/util/path';

module.exports = {
  '@disabled': true, // toggling mode buttons fails too often
  tags: ['walk'],
  'Walk in the park': browser => {
    browser.url(
      `http://localhost:8080/${PREFIX_ITINERARY_SUMMARY}/Katajanokka%3A%3A60.16716%2C24.97992/Kauppatori%3A%3A60.16736%2C24.95171?modes=WALK`,
    );

    browser.url(browser.launch_url);

    browser.page
      .searchFields()
      .itinerarySearch('Helsingin rautatieasema', 'Kaisaniemen puisto');

    browser.page.itinerarySummary().waitForFirstItineraryRow();

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.openQuickSettings();
    customizeSearch.disableAllModalitiesExcept('');

    browser.page.itinerarySummary().waitForItineraryRowOfType('walk');

    browser.end();
  },
};
