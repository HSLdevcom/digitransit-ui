'use strict'

var commands = {
  waitForFirstItineraryInstructionColumn: function() {
    return this.waitForElementVisible("@itineraryInstructionColumn", this.api.globals.itinerarySearchTimeout)
  }, chooseFirstItinerarySuggestion: function() {
    return this.click("@itineraryInstructionColumn");
  }
};

module.exports = {
  commands: [commands],
  elements: {
    itineraryInstructionColumn: ".itinerary-instruction-column"
  }
};
