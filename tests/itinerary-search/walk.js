'use strict'

module.exports = {
    tags: ['walk'],
    'Walk in the park' : function (browser) {
      var browser = browser.url(browser.launch_url);

      var searchFields = browser.page.searchFields();
      searchFields.itinerarySearch("Bryn stasjon", "Kværnerbyen");

      var customizeSearch = browser.page.customizeSearch();
      customizeSearch.clickCanvasToggle();
      customizeSearch.disableAllModalitiesExcept("");

      var itinerarySummary = browser.page.itinerarySummary();
      itinerarySummary.waitForItineraryRowOfType("walk");

      browser.end();
    }
};
