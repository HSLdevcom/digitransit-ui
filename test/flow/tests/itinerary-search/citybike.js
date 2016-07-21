'use strict'

module.exports = {
    tags: ['citybike'],
    'Citybike': function(browser) {
        var browser = browser.url(browser.launch_url);
        browser.page.messages().clickMessagebarClose();  // TODO Shouldn't be needed

        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Katajanokka", "Kauppatori");

        var customizeSearch = browser.page.customizeSearch();
        customizeSearch.clickCanvasToggle();
        customizeSearch.disableAllModalitiesExcept("citybike");
        customizeSearch.enableModality("citybike");

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForFirstItineraryRow();

        browser.end();
    }
};
