module.exports = {
  '@tags': ['itinerary tuning'],
  '@disabled': true,
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
    browser.pause(2000);
    // rautatieasema  - pasila surely had rail connections before disable
    // but disable will remove them
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    itinerarySummary.clickSwapOriginDestination();

    // rail still not available
    itinerarySummary.waitForItineraryRowOfTypeNotPresent('rail');

    browser.end();
  },
};
