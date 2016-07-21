'use strict'

module.exports = {
    "@tags": ["itinerary"],
    'Origin and destination exists in instructions if suggestion is chosen': function(browser) {
        var browser = browser.url(browser.launch_url);

        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("Helsinki central", "Kamppi");

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForFirstItineraryRow();
        itinerarySummary.chooseFirstItinerarySuggestion();

        var itineraryInstructions = browser.page.itineraryInstructions();
        itineraryInstructions.waitForFirstItineraryInstructionColumn();
        itineraryInstructions.verifyOrigin("Helsinki Central railway station, Helsinki");
        itineraryInstructions.verifyDestination("Kamppi, Helsinki");
        browser.end();
    },
    'From King\'s gate to Pohjolanaukio': function(browser) {
        var browser = browser.url(browser.launch_url);
        var searchFields = browser.page.searchFields();
        searchFields.itinerarySearch("King's gate", "Pohjolanaukio");
        browser.page.itinerarySummary().waitForFirstItineraryRow();

        var itinerarySummary = browser.page.itinerarySummary();
        itinerarySummary.waitForFirstItineraryRow();
        itinerarySummary.chooseFirstItinerarySuggestion();

        var itineraryInstructions = browser.page.itineraryInstructions();
        itineraryInstructions.waitForFirstItineraryInstructionColumn();
        itineraryInstructions.verifyOrigin("King's Gate,");
        itineraryInstructions.verifyDestination("Pohjolanaukio");
        browser.end();
    },
}
