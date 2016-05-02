'use strict'

module.exports = {
    'Origin and destination exists in instructions if suggestion is chosen' : function (browser) {
      var browser = browser.url(browser.launch_url);

      var searchFields = browser.page.searchFields();
      searchFields.itinerarySearch("Hausmanns gate", "Malerhaugveien 28, Oslo");

      var itinerarySummary = browser.page.itinerarySummary();
      itinerarySummary.waitForFirstItineraryRow();
      itinerarySummary.chooseFirstItinerarySuggestion();

      var itineraryInstructions = browser.page.itineraryInstructions();
      itineraryInstructions.waitForFirstItineraryInstructionColumn();
      itineraryInstructions.verifyOrigin("Hausmanns gate, Oslo");
      itineraryInstructions.verifyDestination("Malerhaugveien 28, Oslo");
      browser.end();
    }
}
