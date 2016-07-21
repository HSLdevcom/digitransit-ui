'use strict'

module.exports = {
    tags: ['air'],
    'Travel from Oslo Lufthavn to Trondheim Lufthavn Værnes': function(browser) {
        var browser = browser.url(browser.launch_url);

        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Oslo Lufthavn", "Trondeim lufthavn Værnes");

        var customizeSearch = browser.page.customizeSearch();
        customizeSearch.clickCanvasToggle();
        customizeSearch.disableAllModalitiesExcept("air");
        customizeSearch.enableModality("air");

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForItineraryRowOfType("airplane");

        browser.end();
    }
};