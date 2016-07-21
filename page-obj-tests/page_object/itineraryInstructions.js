'use strict'

var commands = {
    waitForFirstItineraryInstructionColumn: function() {
        return this.waitForElementVisible("@itineraryInstructionColumn", this.api.globals.itinerarySearchTimeout)
    },
    verifyOrigin: function(origin) {
        return this.waitForElementVisible("@itineraryOrigin", this.api.globals.itinerarySearchTimeout)
            .assert.containsText("@itineraryOrigin", origin);
    },
    verifyDestination: function(destination) {
        return this.waitForElementVisible("@itineraryDestination", this.api.globals.itinerarySearchTimeout)
            .assert.containsText("@itineraryDestination", destination);
    }
};

module.exports = {
    commands: [commands],
    elements: {
        itineraryInstructionColumn: ".itinerary-instruction-column",
        itineraryOrigin: ".itinerary-leg-first-row:nth-of-type(1)",
        itineraryDestination: ".itinerary-leg-first-row:last-of-type"

    }
};