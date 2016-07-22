'use strict'

module.exports = {
    tags: ['citybike'],
    'Citybikes are used when it\'s the only modality': function(browser) {
        var browser = browser.url(browser.launch_url);
        browser.page.messages().clickMessagebarClose();  // TODO Shouldn't be needed

        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Katajanokka", "Kauppatori");

        var customizeSearch = browser.page.customizeSearch();
        customizeSearch.clickCanvasToggle();
        customizeSearch.disableAllModalitiesExcept("citybike");
        customizeSearch.enableModality("citybike");

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForItineraryRowOfType('citybike');

        browser.end();
    },

    'Citybikes are not used when disabled': function(browser) {
        var browser = browser.url(browser.launch_url);
        browser.page.messages().clickMessagebarClose();  // TODO Shouldn't be needed

        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Katajanokka", "Kauppatori");

        var customizeSearch = browser.page.customizeSearch();
        customizeSearch.clickCanvasToggle();
        customizeSearch.disableAllModalitiesExcept();

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForItineraryRowOfTypeNotPresent('citybike');

        browser.end();
    }
};
