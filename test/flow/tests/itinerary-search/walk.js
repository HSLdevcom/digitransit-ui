module.exports = {
  tags: ['walk'],
  'Walk in the park': (browser) => {
    browser.url(browser.launch_url);
    browser.page.messages().clickMessagebarClose();  // TODO shouldn't be needed

    browser.page.searchFields().itinerarySearch('Helsinki central railway', 'Kaisaniemen puisto');

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.clickCanvasToggle();
    customizeSearch.disableAllModalitiesExcept('');

    browser.page.itinerarySummary().waitForItineraryRowOfType('walk');

    browser.end();
  },
};
