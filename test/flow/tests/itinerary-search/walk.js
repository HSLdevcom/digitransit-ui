module.exports = {
  tags: ['walk'],
  'Walk in the park': browser => {
    browser.url(browser.launch_url);
    const splash = browser.page.splash();
    splash.waitClose();

    browser.page
      .searchFields()
      .itinerarySearch('Helsingin rautatieasema', 'Kaisaniemen puisto');

    const customizeSearch = browser.page.customizeSearch();
    customizeSearch.clickCanvasToggle();
    customizeSearch.disableAllModalitiesExcept('');

    browser.page.itinerarySummary().waitForItineraryRowOfType('walk');

    browser.end();
  },
};
