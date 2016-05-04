'use strict'

var commands = {
    clickAnyMarker: function() {
        return this.click("@anyStopMarker");
    },
    waitForDepartureVisible: function() {
        return this.waitForElementVisible("@departure", this.api.globals.itinerarySearchTimeout);
    },
    expectCardHeader: function(expected) {
        this.waitForElementVisible("@cardHeader", this.api.globals.itinerarySearchTimeout);
        return this.assert.containsText("@cardHeader", expected);
    }
}

module.exports = {
    commands: [commands],
    elements: {
        departure: {
            selector: ".departure .route-detail-text"
        },
        cardHeader: {
            selector: ".card-header > span.h3"
        }
    }
}