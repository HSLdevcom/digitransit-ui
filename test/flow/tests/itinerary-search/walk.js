'use strict'

module.exports = {
    tags: ['walk'],
    'Walk in the park': function(browser) {
        var browser = browser.url(browser.launch_url);
        browser.page.messages().clickMessagebarClose();  // TODO shouldn't be needed

        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Helsinki central railway", "Kaisaniemen puisto");

        var customizeSearch = browser.page.customizeSearch();
        customizeSearch.clickCanvasToggle();
        customizeSearch.disableAllModalitiesExcept("");

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForItineraryRowOfType("walk");

        browser.end();
    }
};
