module.exports = {
  '@tags': ['itinerary tuning'],

  'Custom search options are not forgotten if endpoint changes': browser => {
    browser.url(browser.launch_url);

    const searchFields = browser.page.searchFields();
    searchFields.itinerarySearch('Helsingin rautatieasema', 'Opastinsilta 6');

    const itinerarySummary = browser.page.itinerarySummary();
    itinerarySummary.waitForFirstItineraryRow();

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.clickCanvasToggle();
    customizeSearch.waitOffcanvasOpen();

    customizeSearch.disableModality('rail');
    customizeSearch.closeCanvas();

    // rautatieasema  - pasila surely had rail connections before disable
    // but disable will remove them
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    itinerarySummary.clickSwapOriginDestination();

    // rail still not available
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    browser.end();
  },

  'Current location is updated': browser => {
    browser.url(browser.launch_url); // Opastinsilta

    browser.setGeolocation(60.17, 24.941); // asema-aukio
    browser.page.searchFields().selectDestination('Rautatieasema, Helsinki');

    const itinerarySummary = browser.page.itinerarySummary();

    // asema-aukio - rautatieasema is such a
    // short distance that rail should not be offered
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    browser.end();
  },
};
