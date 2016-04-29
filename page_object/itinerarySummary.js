'use strict'

var commands = {
  waitForFirstItineraryRow: function() {
    return this.waitForElementVisible("@firstItinerarySummaryRow", this.api.globals.itinerarySearchTimeout)
  },
  chooseFirstItinerarySuggestion: function() {
    return this.click("@firstItinerarySummaryRow");
  }
};

module.exports = {
  commands: [commands],
  elements: {
    firstItinerarySummaryRow: ".itinerary-summary-row:nth-of-type(1)"
  }
};
