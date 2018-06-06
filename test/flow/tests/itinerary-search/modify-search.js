module.exports = {
  '@tags': ['itinerary tuning'],
  '@disabled': false,

  'Custom search options are not forgotten if endpoint changes': browser => {
    browser.url(browser.launch_url);

    const searchFields = browser.page.searchFields();
    searchFields.itinerarySearch('Helsingin rautatieasema', 'Opastinsilta 6');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.openQuickSettings();
    customizeSearch.disableModality('rail');
    itinerarySummary.waitForFirstItineraryRow();

    // rautatieasema  - pasila surely had rail connections before disable
    // but disable will remove them
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    itinerarySummary.clickSwapOriginDestination();

    // rail still not available
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    browser.end();
  },

  'Earlier and later buttons work': browser => {
    browser.url(browser.launch_url);

    const searchFields = browser.page.searchFields();
    searchFields.itinerarySearch('Helsingin rautatieasema', 'Opastinsilta 6');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.waitForItineraryRowOfType('rail');

    itinerarySummary.clickLater();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.waitForItineraryRowOfType('rail');

    itinerarySummary.clickEarlier();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.waitForItineraryRowOfType('rail');

    itinerarySummary.clickNow();
    itinerarySummary.waitForFirstItineraryRow();
    itinerarySummary.waitForItineraryRowOfType('rail');

    browser.end();
  },
};
