'use strict'

module.exports = {
    tags: ['citybike'],
    'CityBike in Trondheim': function(browser) {
        var browser = browser.url(browser.launch_url);

        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Nidareid 6", "Gløshaugveien 4");

        var customizeSearch = browser.page.customizeSearch();
        customizeSearch.clickCanvasToggle();
        customizeSearch.disableAllModalitiesExcept("citybike");
        customizeSearch.enableModality("citybike");

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForFirstItineraryRow();

        browser.end();
    }
};